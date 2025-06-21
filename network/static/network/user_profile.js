document.addEventListener("DOMContentLoaded", function() {
    load_profile_info();
    load_posts();
    setup_tooltips();
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

function setup_tooltips() {
    const username = window.location.pathname.split('/').pop();
    
    const followersContainer = document.querySelector('.followers .tooltip-container');
    if (followersContainer) {
        followersContainer.addEventListener('mouseenter', () => {
            load_followers_tooltip(username);
        });
        followersContainer.addEventListener('mouseleave', () => {
            hide_tooltip('followers-tooltip');
        });
    }
    
    const followingContainer = document.querySelector('.following .tooltip-container');
    if (followingContainer) {
        followingContainer.addEventListener('mouseenter', () => {
            load_following_tooltip(username);
        });
        followingContainer.addEventListener('mouseleave', () => {
            hide_tooltip('following-tooltip');
        });
    }
}

function load_followers_tooltip(username) {
    fetch(`/api/followers/${username}`)
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('followers-list');
        
        if (data.followers.length === 0) {
            hide_tooltip('followers-tooltip');
        } else {
            show_tooltip('followers-tooltip');
            list.innerHTML = data.followers.map(follower => 
                `<div>${follower}</div>`
            ).join('');
        }
    })
    .catch(error => {
        console.error('Error loading followers:', error);
    });
}

function load_following_tooltip(username) {
    fetch(`/api/following/${username}`)
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('following-list');
        
        if (data.following.length === 0) {
            hide_tooltip('following-tooltip');
        } else {
            show_tooltip('following-tooltip');
            list.innerHTML = data.following.map(following => 
                `<div>${following}</div>`
            ).join('');
        }
        
    })
    .catch(error => {
        console.error('Error loading following:', error);
    });
}

function show_tooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (tooltip) {
        tooltip.classList.add('show');
    }
}

function hide_tooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    if (tooltip) {
        tooltip.classList.remove('show');
    }
}