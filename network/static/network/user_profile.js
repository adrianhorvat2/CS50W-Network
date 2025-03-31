document.addEventListener("DOMContentLoaded", function() {

    load_posts();
});

function load_posts(){
    document.querySelector('#posts-view').innerHTML = '';
    const username = window.location.pathname.slice(1);
    fetch(`/api/profile/${username}`)
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
