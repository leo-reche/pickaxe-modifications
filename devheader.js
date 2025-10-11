 /* <!-- 
<div class="fc-banner" role="status" aria-live="polite">
  <span>
    ✨ New Bots released! Try out Grok (American), DeepSeek (Chinese) and Mistral (French).
  </span>
  <button class="fc-banner__close" type="button" aria-label="Dismiss announcement">×</button>
</div>

<style>
  .fc-banner {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 9999;
    box-sizing: border-box;
    max-width: 95%;
    background: #f9fafb;  softer gray 
    color: #111;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    text-align: center;
    font: 600 14px/1.4 system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

    overflow: hidden;
    max-height: var(--fc-banner-h, 200px);
    opacity: 1;
    transition: max-height 300ms ease, opacity 300ms ease, padding 300ms ease, border-color 300ms ease, transform 300ms ease;
  }

  .fc-banner span {
    max-width: 800px;
  }

  .fc-banner__close {
    flex-shrink: 0;
    border: 0;
    background: rgba(0, 0, 0, 0.06);
    color: #111;
    border-radius: 6px;
    padding: 4px 10px;
    cursor: pointer;
    font-size: 16px;
    line-height: 1;
  }

  .fc-banner__close:hover,
  .fc-banner__close:focus {
    background: rgba(0, 0, 0, 0.12);
    outline: none;
  }

  .fc-banner.is-hiding {
    opacity: 0;
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    border-color: transparent;
    transform: translate(-50%, -10px);
  }

  @media (prefers-reduced-motion: reduce) {
    .fc-banner {
      transition: none;
    }
  }
</style>


<script>
  (function () {
    const banner = document.querySelector('.fc-banner');
    if (!banner) return;

    function setHeightVar() {
      banner.style.setProperty('--fc-banner-h', banner.scrollHeight + 'px');
    }
    setHeightVar();
    window.addEventListener('resize', setHeightVar);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(setHeightVar).catch(() => {});
    }

    function hideBanner() {
      if (banner.classList.contains('is-hiding')) return;
      banner.classList.add('is-hiding');
      banner.addEventListener('transitionend', () => banner.remove(), { once: true });
    }

    const timer = setTimeout(hideBanner, 5000);

    banner.addEventListener('click', function (e) {
      if (e.target.closest('.fc-banner__close')) {
        clearTimeout(timer);
        hideBanner();
      }
    });
  })();
</script>

Banner HTML -->*/


//=========== Pricing Redirect

function checkPricingRedirect() {
  if (window.location.pathname === "/pricing") {
    window.location.href = "https://docs.google.com/forms/d/1QB7krvh2ypt8No2kzOwfR7DUUHGxFxDnkNIv7a6KJ_I/edit";
  }
}

// Listen for initial page load
checkPricingRedirect();

// Listen for history (client-side routing) changes
window.addEventListener('popstate', checkPricingRedirect);

const origPushState = history.pushState;
history.pushState = function(...args) {
  origPushState.apply(this, args);
  checkPricingRedirect();
};
 

// ================ DB Sync

let formId = null;
let responseId = null;
let studioUserId = null;
let latestRequest = null;
let documents = null;
let wasStopped = false;
let pastedContent = [""];
let currentAbortController = null;



// syncing with database
function syncConversation(responseId,formId,studioUserId,pastedContent,url){
if (url.includes("https://core-api.pickaxe.co/pickaxe/sse")) {
    try {
    console.log("trying")
    const apiUrl = "https://dashboard-backend-395477780264.europe-west1.run.app";
    const payload = { 
        responseId: responseId,
        formId: formId,
        userId: studioUserId,
        pastedContent: pastedContent
    };
    originalFetch(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    pastedContent.length = 0;
    } catch (e) {
        console.error("Error posting to external API:", e);
    }
}
}

function errorMessageHandler(){

    console.log("Header.ErrorMessageHandler")

    setTimeout(function(){ //waits 50ms for the "error message" to load
    var errBox = document.querySelector('div.text-\\[14px\\].max-\\[1024px\\]\\:text-\\[14px\\].max-\\[899px\\]\\:text-\\[14px\\].font-semibold'); //gets the "error message"
    if (errBox){
        const txtBox = document.querySelector('#studio-root textarea.resize-none');
        if (txtBox) {  //Inserts last request back into input
                const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
                    window.HTMLTextAreaElement.prototype,
                    'value'
                ).set;
                nativeTextareaValueSetter.call(txtBox, latestRequest);
                const inputEvent = new Event('input', { bubbles: true });
                txtBox.dispatchEvent(inputEvent);
        }
        errBox.textContent = "There has been an error. Please try sending your message again";
        var allMsgs = document.querySelectorAll('div.gap-y-3.text-left')
        allMsgs[allMsgs.length-1].style.backgroundColor = 'rgba(200, 200, 200, 0.5)';  //makes last message gray
    }
    }, 50); 

}




let originalFetch = window.fetch;

// Overwrite the global fetch function
window.fetch = async function(...args) {

    const [url, config] = args;

    console.log("SyncFetch-URL:",url)

    if (url.includes("https://core-api.pickaxe.co/pickaxe")){   //Massive if{} to get the formid,responseid,lastmessage,documents
        const aUrl = new URL(url)
        if (aUrl.searchParams.has("formid")) {
            formId = aUrl.searchParams.get("formid")
            console.log("formId: ",formId," responseiId: ",responseId," studioUserId: ",studioUserId)
        }
        if (aUrl.searchParams.has("responseid")) {
            responseId = aUrl.searchParams.get("responseid")
            console.log("formId: ",formId," responseiId: ",responseId," studioUserId: ",studioUserId)
        }
        try {
            formId = JSON.parse(config.body).formId
            console.log("formId: ",formId," responseiId: ",responseId," studioUserId: ",studioUserId)
        } catch(e){}
        try {
            responseId = JSON.parse(config.body).responseId
            console.log("formId: ",formId," responseiId: ",responseId," studioUserId: ",studioUserId)
        } catch(e){}
        try {
            latestRequest = JSON.parse(config.body).value
            console.log("formId: ",formId," responseiId: ",responseId," studioUserId: ",studioUserId)
        } catch(e){}
        try {
            studioUserId = JSON.parse(config.body).studioUserId
            console.log("formId: ",formId," responseiId: ",responseId," studioUserId: ",studioUserId)
        } catch(e){}
        try {
            documents = JSON.parse(config.body).documentIds
            console.log("documents: ",documents)
        } catch(e){}
     

    
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;
        console.log("SyncFetch - Creating Abort")

        try {  
        console.log("SyncFetch - Calling OriginalFetch") 
        const response = await originalFetch(url, { ...config, signal }); //Original fetch
        const out = response.clone(); // return this to your UI
        

        (async () => {
            try {
            
            const r = out.body.getReader();
            while (!(await r.read()).done) {}
            errorMessageHandler()

            setTimeout(() => {syncConversation(responseId, formId, studioUserId, pastedContent, url);}, 2000);

            } catch (_) {}


        })();

        return response;

        } catch (error) {

        console.log("Sync fetch caught this error: ", error)
        stopButtonOff()

        }
    
    } else {
        return await originalFetch(url, {...config});
    }
};


function stopStream() {
    if (currentAbortController) { //stops the stream
        currentAbortController.abort();
        console.log("Sent signal to abort")
    }

    const txtBox = document.querySelector('#studio-root textarea.resize-none');
    if (txtBox) {  //Inserts last request back into input
            console.log("Stop-Stream-Textbox identified")
            const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype,
                'value'
            ).set;
            nativeTextareaValueSetter.call(txtBox, latestRequest);
            const inputEvent = new Event('input', { bubbles: true });
            txtBox.dispatchEvent(inputEvent);
    }

    setTimeout(function(){ //waits 50ms for the "error message" to load
        console.log("StopStream-RenamingErrorBox")
        var errBox = document.querySelector('div.text-\\[14px\\].max-\\[1024px\\]\\:text-\\[14px\\].max-\\[899px\\]\\:text-\\[14px\\].font-semibold'); //gets the "error message"
        if(errBox){
            console.log("StopStream-ErrorBoxFound")
            errBox.textContent = "This response was stopped by the user.";
        }
        var allMsgs = document.querySelectorAll('div.gap-y-3.text-left');
        allMsgs[allMsgs.length-1].style.backgroundColor = 'rgba(200, 200, 200, 0.5)';  //makes last message gray
        var thread = document.querySelector('div.grid.grid-cols-1.gap-y-6.w-full');
        

    }, 100); 
}



// ============= XHL Replacing Characters

const originalXHR2 = XMLHttpRequest;

XMLHttpRequest = function() {
  const xhr = new originalXHR2();
  
  const PATTERN_REPLACEMENTS = {
    '\\[': ' $$ ',     // Replace \[ with $$
    '\\]': ' $$ ',     // Replace \] with $$
    '\\(': ' $$ ',     // Replace \( with $$
    '\\)': ' $$ ',     // Replace \) with $$
    '<think>':'<div id=\\"reason\\" class=\\"reasoning\\">',
    '</think>':'</div>',
  };
  
  // Store the original open method
  const originalOpen = xhr.open;
  let requestUrl = '';
  
  // Override the open method to capture the URL
  xhr.open = function(method, url, ...args) {
    requestUrl = url;
    return originalOpen.apply(this, [method, url, ...args]);
  };
  
  // Override the responseText getter
  Object.defineProperty(xhr, 'responseText', {
    get: function() {
      let originalResponse = Object.getOwnPropertyDescriptor(originalXHR2.prototype, 'responseText').get.call(this);
      
      // Check if this is from the chat conversation endpoint and we have a response
      if (requestUrl && requestUrl.startsWith('https://core-api.pickaxe.co/pickaxe/chat/conversation') && originalResponse) {
        // Apply all pattern replacements using simple string replacement
        let modifiedResponse = originalResponse;
        for (const [pattern, replacement] of Object.entries(PATTERN_REPLACEMENTS)) {
          modifiedResponse = modifiedResponse.replaceAll(pattern, replacement);
        }
        
        // Log right before returning
        console.log("Returning modified response:", modifiedResponse);
        
        return modifiedResponse;
      }
      
      return originalResponse;
    }
  });
  
  return xhr;
};






//Event listener for the click on expand thinging
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('reasoning')) {
        e.target.classList.toggle('expanded');
    }
});



// Overwrite the global xml object
const OriginalXHR = XMLHttpRequest;


XMLHttpRequest = new Proxy(OriginalXHR, {
construct(target, args) {
    const xhr = new target(...args);
    let interceptedUrl = '';

    const originalOpen = xhr.open;
    xhr.open = function(method, url, ...rest) {
    console.log("xhr.open called with:", method, url);
    interceptedUrl = url; // Store the URL for later use
    return originalOpen.apply(this, [method, url, ...rest]);
    };

    const originalSend = xhr.send;
    xhr.send = function(body) {
    console.log("xhr.send called with body:", body);
    
    if (interceptedUrl.includes("https://core-api.pickaxe.co/feedback")) {   
        console.log("sending feedback with payload:", body);
        
        // Parse the body if it's a string, or use it directly if it's already an object
        let payloadData;
        try {
        payloadData = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
        payloadData = body; // Use as-is if parsing fails
        }
        
        originalFetch("https://hooks.zapier.com/hooks/catch/8011346/u9d1eee/", {
        method: "POST",
        body: JSON.stringify(payloadData)
        });
    }
    
    return originalSend.apply(this, [body]);
    };

    return xhr;
}
});