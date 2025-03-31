document.addEventListener("DOMContentLoaded", function() {

    load_posts();
    follow_button();
});

function load_posts(){
    document.querySelector('#posts-view').innerHTML = '';
    const username = window.location.pathname.split('/').pop();
    fetch(`/api/profile/${username}`)
    .then(response => response.json())
    .then(data => {
        const posts = data.posts;
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

function follow_button() {
    const followButton = document.querySelector('#follow-button');
    const username = window.location.pathname.split('/').pop();

    fetch(`/api/profile/${username}`)
        .then(response => response.json())
        .then(user => {
            followButton.innerText = user.is_following ? 'Unfollow' : 'Follow';
            followButton.onclick = toggle_follow;
        });
}

function toggle_follow() {
    const followButton = document.querySelector('#follow-button');
    const username = window.location.pathname.split('/').pop();

    fetch(`/api/profile/${username}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(user => {
        followButton.innerText = user.is_following ? 'Unfollow' : 'Follow';
        document.getElementById("followers-count").innerText = `Followers: ${user.followers}`;   
    });
}
