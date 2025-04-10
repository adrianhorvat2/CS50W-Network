document.addEventListener("DOMContentLoaded", function() {
    const currentPath = window.location.pathname;
    
    const postForm = document.querySelector('#post-form');
    if (postForm) {
        postForm.addEventListener('submit', submit_post);
    }
    
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
    .then(response => response.json())
    .then(result => {
        document.querySelector('#post-content').value = '';
        const currentPath = window.location.pathname;
        if (currentPath === '/following') {
            load_posts('/following_api');
        } else {
            load_posts('/posts');
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