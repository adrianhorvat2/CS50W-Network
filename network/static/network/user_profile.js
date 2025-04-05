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
            const isOwner = post.user === data.logged_in_user;
            const post_div = document.createElement('div');
            post_div.classList.add('post');

            post_div.setAttribute("id", `post-${post.id}`);
            post_div.innerHTML = `
                <p class="post-content">${post.content}</p>
                <div class="post-meta-container">
                    <div class="post-meta">By <strong><a href="${post.user}">${post.user}</a></strong> <small>${post.timestamp}</small></div>
                    ${
                        isOwner ? `
                            <button type="button" class="edit-button" onclick="edit_post(${post.id})">Edit</button>
                            <button type="button" class="save-button" style="display:none;" onclick="save_edit(${post.id})">Save</button>
                        ` : ''
                    }
                    <div class="post-likes" style="display: flex; align-items: center;">
                        <span class="heart-icon" onclick="toggleLike(${post.id})">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor" class="h-6 w-6">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </span>
                        <p style="margin-left: 5px;">${post.likes}</p>
                    </div>
                </div>
            `;

            const heartIcon = post_div.querySelector('.heart-icon svg');
            if (post.liked) { 
                heartIcon.setAttribute('fill', '#888');
            } else {
                heartIcon.setAttribute('fill', 'none');
            }

            document.querySelector('#posts-view').appendChild(post_div);

        });
        create_pagination_controls(data.current_page, data.total_pages);
    });
}

function toggleLike(post_id) {
    const heartIcon = document.querySelector(`#post-${post_id} .heart-icon svg`);
    const likesCounter = document.querySelector(`#post-${post_id} .post-likes p`);

    fetch(`/posts`, {
        method: 'POST', 
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            post_id: post_id
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.liked) {
            heartIcon.classList.add('liked');
            heartIcon.setAttribute('fill', '#888');
        } else {
            heartIcon.classList.remove('liked');
            heartIcon.setAttribute('fill', 'none');
        }

        if (data.likes !== undefined) {
            likesCounter.textContent = data.likes;
        }
    })
    .catch(error => {
        console.error('Error toggling like:', error);
    });
}

function edit_post(post_id) {
    const postDiv = document.querySelector(`#post-${post_id}`);
    const contentDiv = postDiv.querySelector(".post-content");
    const originalContent = contentDiv.innerText;

    contentDiv.innerHTML = `
        <textarea id="edit-content-${post_id}" class="edit-textarea">${originalContent}</textarea>
    `;

    const editButton = postDiv.querySelector(".edit-button");
    const saveButton = postDiv.querySelector(".save-button");

    editButton.style.display = "none";  
    saveButton.style.display = "inline";  
}


function save_edit(post_id) {

    const newContent = document.querySelector(`#edit-content-${post_id}`).value;

    fetch(`/posts`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            post_id: post_id,
            content: newContent
        })
    })
    .then(response => {
        if (response.ok) {
            const postDiv = document.querySelector(`#post-${post_id}`);
            const contentDiv = postDiv.querySelector(".post-content");

            contentDiv.innerText = newContent;
            postDiv.querySelector(".edit-button").style.display = "inline";
            postDiv.querySelector(".save-button").style.display = "none";
        } else {
            console.error('Error while updating post.');
        }
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
