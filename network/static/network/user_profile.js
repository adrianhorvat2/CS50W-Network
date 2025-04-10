document.addEventListener("DOMContentLoaded", function() {
    load_profile_info();
    load_posts(1);
});

function load_profile_info() {
    const username = window.location.pathname.split('/').pop();

    fetch(`/api/profile/${username}`)
    .then(response => response.json())
    .then(user => {
        document.getElementById("profile-username").innerText = `${user.username}'s Profile`;
        document.getElementById("followers-count").innerText = user.followers;
        document.getElementById("following-count").innerText = user.following;

        const followButton = document.getElementById("follow-button");
        followButton.innerText = user.is_following ? 'Unfollow' : 'Follow';
        followButton.onclick = toggle_follow;
    });
}

function load_posts(page=1) {
    document.querySelector('#posts-view').innerHTML = '';
    const username = window.location.pathname.split('/').pop();

    fetch(`/api/profile/${username}?page=${page}`)
    .then(response => response.json())
    .then(data => {
        const posts = data.posts;
        const loggedInUser = data.logged_in_user;
        
        posts.forEach(post => {
            const isOwner = post.user === loggedInUser;
            const postElement = createPostElement(post, isOwner, loggedInUser);
            document.querySelector('#posts-view').appendChild(postElement);
        });

        create_pagination_controls(data.current_page, data.total_pages, load_posts);
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
        load_profile_info(); 
    });
}