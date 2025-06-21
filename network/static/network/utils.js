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
        }
    });
}

function createPostElement(post, isOwner) {
    const post_div = document.createElement('div');
    post_div.classList.add('post');
    post_div.setAttribute("id", `post-${post.id}`);

    const breaklineContent = post.content.replace(/\n/g, "<br>");

    post_div.innerHTML = `
        <p class="post-content">${breaklineContent}</p>
        <div class="post-meta-container">
            <div class="post-meta">By <strong><a href="${post.user}">${post.user}</a></strong> <small>${post.timestamp}</small></div>
            <div class="post-likes" style="display: flex; align-items: center; gap: 10px;">
            ${
                isOwner ? `
                    <button type="button" class="edit-button" onclick="edit_post(${post.id})">Edit</button>
                    <button type="button" class="save-button" style="display:none;" onclick="save_edit(${post.id})">Save</button>
                ` : ''
            }
                <span class="heart-icon" onclick="toggleLike(${post.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-6 w-6">
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
    
    return post_div;
}

function create_pagination_controls(currentPage, totalPages, loadFunction) {
    if (totalPages <= 1) return;

    const pagination_div = document.createElement('div');
    pagination_div.classList.add('pagination');
    
    if (currentPage > 1) {
        const prev_button = document.createElement('button');
        prev_button.innerText = 'Previous';
        prev_button.classList.add('pagination-button');
        prev_button.addEventListener('click', () => {
            loadFunction(currentPage - 1);
        });
        pagination_div.appendChild(prev_button);
    }
    
    const page_indicator = document.createElement('span');
    page_indicator.classList.add('page-indicator');
    page_indicator.innerText = `Page ${currentPage} of ${totalPages}`;
    pagination_div.appendChild(page_indicator);
    
    if (currentPage < totalPages) {
        const next_button = document.createElement('button');
        next_button.innerText = 'Next';
        next_button.classList.add('pagination-button');
        next_button.addEventListener('click', () => {
            loadFunction(currentPage + 1);
        });
        pagination_div.appendChild(next_button);
    }
    
    document.querySelector('#posts-view').appendChild(pagination_div);
}