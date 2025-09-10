window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('fundraisingForm');
  const container = document.getElementById('pagesContainer');

  let ideas = [];      
  let history = [];
  let historyRedo = [];

  async function loadIdeas() {
    try {
      const res = await fetch("/api/ideas");
      ideas = await res.json();
      renderAllIdeas();
    } catch (err) {
      console.error("Failed to load ideas from server:", err);
    }
  }

  async function addIdeaToServer(newIdea) {
    try {
      await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newIdea)
      });
    } catch (err) {
      console.error("Failed to save idea to server:", err);
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

      const index = ideas.indexOf(ideaObj);
      if (index !== -1) {
        ideas.splice(index, 1);
        try {
          await fetch(`/api/ideas/${index}`, { method: 'DELETE' });
        } catch (err) {
          console.error("Failed to delete idea on server:", err);
        }
      }

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

    function saveIdea(imageBase64 = '') {
      history.push(JSON.parse(JSON.stringify(ideas))); 

      const newIdea = { name, idea: ideaText, imageBase64 };
      ideas.push(newIdea);
      renderAllIdeas();
      form.reset();

      addIdeaToServer(newIdea);
    }

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = function() {
        saveIdea(reader.result);
      };
      reader.readAsDataURL(imageFile);
    } else {
      saveIdea();
    }
  });

  document.addEventListener('keydown', function(event) {
    if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
      event.preventDefault();
      if (history.length > 0) {
        historyRedo.push(JSON.parse(JSON.stringify(ideas)));
        ideas = history.pop();
        renderAllIdeas();
      }
    } else if ((event.ctrlKey || event.metaKey) && event.key === 'y') {
      event.preventDefault();
      if (historyRedo.length > 0) {
        history.push(JSON.parse(JSON.stringify(ideas)));
        ideas = historyRedo.pop();
        renderAllIdeas();
      }
    }
  });

  loadIdeas();
});
