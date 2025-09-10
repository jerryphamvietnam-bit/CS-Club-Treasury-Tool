window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fundraisingForm');
  const container = document.getElementById('pagesContainer');

  let ideas = [];
  let history = [];
  let historyRedo = [];

  const IDEAS_API = '/api/ideas'; 

  async function loadIdeas() {
    try {
      const res = await fetch(IDEAS_API);
      if (!res.ok) throw new Error("Server returned " + res.status);
      ideas = await res.json();
      renderAllIdeas();
    } catch (err) {
      console.error("Failed to load ideas from server:", err);
      ideas = [];
    }
  }

  async function saveIdeas() {
    try {
      await fetch(IDEAS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ideas)
      });
    } catch (err) {
      console.error("Failed to save ideas to server:", err);
    }
  }

  function renderAllIdeas() {
    container.innerHTML = '';
    ideas.forEach(renderIdea);
  }

  function renderIdea(ideaObj) {
    const newPage = document.createElement('div');
    newPage.className = 'page';
    newPage.style.color = '#C1C1C1';

    let imgTag = '';
    if (ideaObj.imageBase64) {
      imgTag = `<img src="${ideaObj.imageBase64}" width="250" height="250" alt="uploaded image">`;
    }

    function escapeHtml(s) {
      return String(s)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
    }

    newPage.innerHTML = `<h2>${escapeHtml(ideaObj.name)}</h2>
                         <p style="
                            white-space: pre-wrap; 
                            word-wrap: break-word;  
                            text-align: left;  
                            max-width: 500px;
                            margin: 0;
                            padding: 0;
                         ">${escapeHtml(ideaObj.idea)}</p> 
                         <br>
                         ${imgTag}`;

    const button = document.createElement('button');
    button.textContent = 'Delete';
    button.style.width = '100px';
    button.style.height = '30px';
    button.style.display = 'block';
    button.style.margin = '0 auto';

    button.addEventListener('click', async () => {
      history.push(JSON.parse(JSON.stringify(ideas)));
      historyRedo = [];
      ideas = ideas.filter(i => i !== ideaObj);
      await saveIdeas();
      renderAllIdeas();
    });

    newPage.appendChild(button);
    container.appendChild(newPage);
  }

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name')?.value?.trim() || '';
    const ideaText = document.getElementById('idea')?.value?.trim() || '';
    const imageFile = document.getElementById('imageUpload')?.files?.[0];

    function addIdea(imageBase64 = '') {
      history.push(JSON.parse(JSON.stringify(ideas)));
      const newIdea = { name, idea: ideaText, imageBase64 };
      ideas.push(newIdea);
      saveIdeas();
      renderAllIdeas();
      form.reset();
    }

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function() {
        addIdea(reader.result);
      };
      reader.readAsDataURL(imageFile);
    } else {
      addIdea();
    }
  });

  document.addEventListener('keydown', async function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault();
      if (history.length > 0) {
        historyRedo.push(JSON.parse(JSON.stringify(ideas)));
        ideas = history.pop();
        await saveIdeas();
        renderAllIdeas();
      }
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
      event.preventDefault();
      if (historyRedo.length > 0) {
        history.push(JSON.parse(JSON.stringify(ideas)));
        ideas = historyRedo.pop();
        await saveIdeas();
        renderAllIdeas();
      }
    }
  });

  loadIdeas();
});
