document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname;
    
    const postForm = document.querySelector('#post-form');
    if (postForm) {
        postForm.addEventListener('submit', submit_post);
    }

    const postContent = document.querySelector('#post-content');
    const charCount = document.querySelector('#char-count');
    
    postContent.addEventListener('input', function() {
        const remaining = 512 - this.value.length;
        charCount.textContent = remaining;
    });
    
    const allPostsLink = document.querySelector('#all-posts');
    if (allPostsLink) {
        allPostsLink.addEventListener('click', () => {load_posts('/posts')});
    }
    
    if (currentPath === '/following') {
        load_posts('/following_api');
    } else if (currentPath === '/' || currentPath === '/posts') {
        load_posts('/posts');
    }
});

function submit_post(event) {
    event.preventDefault();
    
    const content = document.querySelector('#post-content').value;
    
    fetch('/posts', {
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
            throw new Error('Post empty');
        }
        return response.json();
    })
    .then(result => {
        if (result.message === "Post created successfully") {
            document.querySelector('#post-content').value = '';
            document.querySelector('#char-count').textContent = '512';
            fetch('/posts?page=1')
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
        const errorDiv = document.querySelector('.message');
        if (errorDiv) {
            errorDiv.textContent = error.message;
        } else {
            const newErrorDiv = document.createElement('div');
            newErrorDiv.className = 'message';
            newErrorDiv.textContent = error.message;
            document.querySelector('#post-form').insertBefore(newErrorDiv, document.querySelector('#post-form button'));
        }
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