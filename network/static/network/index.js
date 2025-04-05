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

        posts.forEach(post => {

            const isOwner = post.user === data.user;
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
                                <path fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </span>
                        <p style="margin-left: 5px;">${post.likes}</p>
                    </div>
                </div>
            `;
            document.querySelector('#posts-view').appendChild(post_div);
        });

        if (data.current_page !== undefined) {
            create_pagination_controls(url, data.current_page, data.total_pages);
        }
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

function create_pagination_controls(url, current_page, total_pages) {

    if (total_pages <= 1) return;

    const pagination_div = document.createElement('div');
    pagination_div.classList.add('pagination');
    
    if (current_page > 1) {
        const prev_button = document.createElement('button');
        prev_button.innerText = 'Previous';
        prev_button.classList.add('pagination-button');
        prev_button.addEventListener('click', () => {
            load_posts(url, current_page - 1);
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
            load_posts(url, current_page + 1);
        });
        pagination_div.appendChild(next_button);
    }
    
    document.querySelector('#posts-view').appendChild(pagination_div);
}