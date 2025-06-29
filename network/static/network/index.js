document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/following') {
        load_posts('/api/following/posts');
    } else if (currentPath === '/') {
        load_posts('/api/posts');
    }

    const postForm = document.querySelector('#post-form');

    const postContent = document.querySelector('#post-content');
    const charCount = document.querySelector('#char-count');
    const errorMessage = document.querySelector('#error-message');
    
    postContent.addEventListener('input', function() {
        const remaining = 512 - this.value.length;
        charCount.textContent = remaining;

        if (this.value.trim()) {
                errorMessage.textContent = '';
                errorMessage.classList.remove('show');
        }
    });
    postForm.addEventListener('submit', submit_post);
    
});

function submit_post(event) {
    event.preventDefault();
    
    const content = document.querySelector('#post-content').value.trim();
    const errorMessage = document.querySelector('#error-message');
    
    if (!content) {
        errorMessage.textContent = "Post cannot be empty";
        errorMessage.classList.add('show');
        return;
    }
    
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');
    
    fetch('/api/posts', {
        method: 'POST',
        body: JSON.stringify({
            content: content
        }),
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(data => {
                throw new Error(data.error);
            });
        }
        return response.json();
    })
    .then(result => {
        if (result.message === "Post created successfully") {
            document.querySelector('#post-content').value = '';
            document.querySelector('#char-count').textContent = '512';
            fetch('/api/posts?page=1')
            .then(response => response.json())
            .then(data => {
                if (data.posts && data.posts.length > 0) {
                    const latestPost = data.posts[0];
                    const isOwner = latestPost.user === data.user;
                    const postElement = createPostElement(latestPost, isOwner, data.user);
                    
                    const postsView = document.querySelector('#posts-view');
                    if (postsView.firstChild) {
                        postsView.insertBefore(postElement, postsView.firstChild);
                    } else {
                        postsView.appendChild(postElement);
                    }
                }
            });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        errorMessage.textContent = error.message;
        errorMessage.classList.add('show');
    });
}

function load_posts(url, page=1) {
    document.querySelector('#posts-view').innerHTML = '';
    const urlWithPage = `${url}?page=${page}`;

    fetch(urlWithPage)
    .then(response => response.json())
    .then(data => {
        const posts = data.posts || data;
        const currentUser = data.user;

        posts.forEach(post => {
            const isOwner = post.user === currentUser;
            const postElement = createPostElement(post, isOwner, currentUser);
            document.querySelector('#posts-view').appendChild(postElement);
        });

        if (data.current_page !== undefined) {
            const loadPostsWithUrl = (pageNum) => load_posts(url, pageNum);
            create_pagination_controls(data.current_page, data.total_pages, loadPostsWithUrl);
        }
    });
}