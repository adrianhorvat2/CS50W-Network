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

        if (data.current_page !== undefined) {
            create_pagination_controls(url, data.current_page, data.total_pages);
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