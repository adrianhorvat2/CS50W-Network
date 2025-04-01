document.addEventListener("DOMContentLoaded", function() {

    load_profile_info();
    load_posts(1);
    follow_button();
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

function load_posts(page=1){

    document.querySelector('#posts-view').innerHTML = '';
    const username = window.location.pathname.split('/').pop();

    fetch(`/api/profile/${username}?page=${page}`)
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
        
        create_pagination_controls(data.current_page, data.total_pages);
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
        load_profile_info(); 
    });
}


function create_pagination_controls(current_page, total_pages) {

    if (total_pages <= 1) return;

    const pagination_div = document.createElement('div');
    pagination_div.classList.add('pagination');
    
    if (current_page > 1) {
        const prev_button = document.createElement('button');
        prev_button.innerText = 'Previous';
        prev_button.classList.add('pagination-button');
        prev_button.addEventListener('click', () => {
            load_posts(current_page - 1);
        });
        pagination_div.appendChild(prev_button);
    }
    
    const page_indicator = document.createElement('span');
    page_indicator.classList.add('page-indicator');
    page_indicator.innerText = `Page ${current_page} of ${total_pages}`;
    pagination_div.appendChild(page_indicator);
    
    if (current_page < total_pages) {
        const next_button = document.createElement('button');
        next_button.innerText = 'Next';
        next_button.classList.add('pagination-button');
        next_button.addEventListener('click', () => {
            load_posts(current_page + 1);
        });
        pagination_div.appendChild(next_button);
    }
    
    document.querySelector('#posts-view').appendChild(pagination_div);
}
