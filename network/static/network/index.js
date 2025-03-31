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
        load_posts();
    });
}

function load_posts(url){
    document.querySelector('#posts-view').innerHTML = '';
    fetch(url)
    .then(response => response.json())
    .then(posts => {
        posts.forEach(post => {
            const post_div = document.createElement('div');
            post_div.classList.add('post');
            post_div.innerHTML = `
                <p>${post.content}</p>
                <div class="post-meta-container">
                    <div class="post-meta">By <strong>${post.user}</strong> <small>${post.timestamp}</small></div>
                    <div class="post-likes">Likes: ${post.likes}</div>
                </div>
            `;
            document.querySelector('#posts-view').appendChild(post_div);
        });
    });
}