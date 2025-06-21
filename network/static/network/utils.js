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
        <div class="edit-controls">
            <div id="edit-char-count-${post_id}" class="char-count">${512 - originalContent.length}</div>
            <div id="edit-error-message-${post_id}" class="error-message"></div>
        </div>
    `;

    const editButton = postDiv.querySelector(".edit-button");
    const saveButton = postDiv.querySelector(".save-button");
    const textarea = document.querySelector(`#edit-content-${post_id}`);
    const charCount = document.querySelector(`#edit-char-count-${post_id}`);
    const errorMessage = document.querySelector(`#edit-error-message-${post_id}`);

    textarea.addEventListener('input', function() {
        const remaining = 512 - this.value.length;
        charCount.textContent = remaining;
        
        if (this.value.trim()) {
            errorMessage.textContent = '';
            errorMessage.classList.remove('show');
        }
    });

    editButton.style.display = "none";  
    saveButton.style.display = "inline";  
}

function save_edit(post_id) {
    const newContent = document.querySelector(`#edit-content-${post_id}`).value.trim();
    const errorMessage = document.querySelector(`#edit-error-message-${post_id}`);
    
    if (!newContent) {
        errorMessage.textContent = "Post cannot be empty";
        errorMessage.classList.add('show');
        return;
    }
    
    if (newContent.length > 512) {
        errorMessage.textContent = "Post cannot exceed 512 characters";
        errorMessage.classList.add('show');
        return;
    }
    
    errorMessage.textContent = '';
    errorMessage.classList.remove('show');

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
                    <span class="delete-icon" onclick="delete_post(${post.id})" style="cursor: pointer; color: #dc3545;">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                        </span>
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

function delete_post(post_id) {
    if (confirm('Are you sure you want to delete this post?')) {
        fetch(`/posts`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                post_id: post_id
            })
        })
        .then(response => {
            if (response.ok) {
                const postElement = document.querySelector(`#post-${post_id}`);
                if (postElement) {
                    postElement.remove();
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
}