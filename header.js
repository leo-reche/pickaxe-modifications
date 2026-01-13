// =============== Banner


document.addEventListener("DOMContentLoaded", function() {
  const banner = document.createElement("div");
  banner.className = "fc-banner";
  banner.setAttribute("role", "status");
  banner.setAttribute("aria-live", "polite");
  banner.innerHTML = `
    <span>
      Pickaxe is experiencing a server errors today. We're already in contact with them, and apologize for any inconveniences!
    </span>
    <button class="fc-banner__close" type="button" aria-label="Dismiss announcement">×</button>
  `;

  // Add close button functionality
  banner.querySelector(".fc-banner__close").addEventListener("click", () => {
    banner.remove();
  });

  // Insert at the top of the body
  document.body.prepend(banner);

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



});

  

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
let currentSubmissionId = null; //This will store the Submission ID



// syncing with database
function syncConversation(responseId,formId,studioUserId,pastedContent,url){
console.log("syncStart")
if (url.includes("https://core-pickaxe-api.pickaxe.co/stream")) {
    try {
    const apiUrl = "https://dashboard-backend-395477780264.europe-west1.run.app";
    const payload = { 
        responseId: responseId,
        formId: formId,
        userId: studioUserId,
        pastedContent: pastedContent
    };
    originalFetch2(apiUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });
    pastedContent.length = 0;
    } catch (e) {
    }
}
}

function errorMessageHandler(){
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


let originalFetch2 = window.fetch;

window.fetch = function(input, init) {
  const url = typeof input === 'string' ? input : input.url;
  
  return originalFetch2.call(this, input, init)
    .then(response => {
      // If this request has the SSE URL
      if (url === 'https://core-pickaxe-api.pickaxe.co/stream') {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/event-stream')) {
          
          // PATTERNS CONFIGURATION - Now a dictionary/object

          const PATTERN_REPLACEMENTS = {
            /*
                '\\[': '\n $$ \n',     // Replace \[ with $$
                '\\]': '\n $$ \n',     // Replace \] with $$
                '\\(': ' $$ ',     // Replace \( with $$
                '\\)': ' $$ ',     // Replace \) with $$
              */
                '<think>':'<div id=\'reason\' class=\'reasoning\'>',
                '</think>':'</div>',
          };


          // Get all patterns for partial detection
          const ALL_PATTERNS = Object.keys(PATTERN_REPLACEMENTS);
          
          // Get the original response body stream
          const originalStream = response.body;
          const reader = originalStream.getReader();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();
          
          // Buffer to handle partial patterns across chunks
          let partialBuffer = '';
          
          // Get the abort signal if it exists
          const abortSignal = init?.signal;
          let isAborted = false;
          

          
          // Create a new ReadableStream that will process and pass through the data
          const newStream = new ReadableStream({
            async start(controller) {
              
              // Set up abort handler if signal exists
              const handleAbort = () => {
                isAborted = true;
                
                try {
                  // Cancel the reader
                  reader.cancel().catch(err => {
                  });
                  
                  // Close the controller with an abort error
                  controller.error(new DOMException('Aborted', 'AbortError'));
                } catch (err) {
                }
              };
              
              if (abortSignal) {
                if (abortSignal.aborted) {
                  // Already aborted
                  handleAbort();
                  return;
                }
                
                // Listen for abort event
                abortSignal.addEventListener('abort', handleAbort);
              }
              
              let mathBuffer = '';
              async function pump() {
                try {
                  // Check if aborted before reading
                  if (isAborted) {;
                    return;
                  }
                  
                  const { done, value } = await reader.read();
                  
                  if (done) {

                    // Clean up abort listener if it exists
                    if (abortSignal) {
                      abortSignal.removeEventListener('abort', handleAbort);
                    }
                    
                    controller.close();
                    return;
                  }
                  
                  // Check again after read in case abort happened during read
                  if (isAborted) {
                    return;
                  }
                  
                  // Decode the chunk
                  const chunk = decoder.decode(value, { stream: true });
                  
                  // Parse the SSE lines and modify token content
                  let mathModeOn = false
                  let modifiedChunk = '';
                  const lines = chunk.split('\n');
                  
                  lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                      const jsonStr = line.slice(6);
                      try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.token) {
                          // Combine with partial buffer for pattern detection
                          let tokenToProcess = partialBuffer + parsed.token;
                          
                          // Replace all pattern instances with their specific replacements
                          let modifiedToken = tokenToProcess;
                          let patternsFound = false;

                          if (modifiedToken.includes("$")){
                            mathModeOn = true
                          }

                          // substitute on the modified token
                          Object.entries(PATTERN_REPLACEMENTS).forEach(([pattern, replacement]) => {
                            if (modifiedToken.includes(pattern)) {
                              
                              patternsFound = true;
                              // Replace all instances of the pattern with its specific replacement
                              modifiedToken = modifiedToken.split(pattern).join(replacement);
                            }
                          });

                          // Handle partial patterns at the end
                          partialBuffer = '';
                          let longestPartial = '';
                          
                          ALL_PATTERNS.forEach(pattern => {
                            for (let i = pattern.length - 1; i > 0; i--) {
                              const partialPattern = pattern.substring(0, i);
                              if (modifiedToken.endsWith(partialPattern)) {
                                if (partialPattern.length > longestPartial.length) {
                                  longestPartial = partialPattern;
                                }
                              }
                            }
                          });
                          
                          if (longestPartial) {
                            // Remove the partial from the token and store it in buffer
                            partialBuffer = longestPartial;
                            modifiedToken = modifiedToken.slice(0, -longestPartial.length);
                          }
                          
                          // Reconstruct the data line with modified token
                          parsed.token = modifiedToken;
                          modifiedChunk += 'data: ' + JSON.stringify(parsed) + '\n';

                        } else {
                          // Non-token data, pass through unchanged
                          modifiedChunk += line + '\n';
                        }
                      } catch (e) {
                        // Non-JSON lines, pass through unchanged
                        modifiedChunk += line + '\n';
                      }
                    } else {
                      // Non-data lines, pass through unchanged
                      modifiedChunk += line + '\n';
                    }
                  });
                  
                  // Remove the extra newline at the end if present
                  if (modifiedChunk.endsWith('\n\n')) {
                    modifiedChunk = modifiedChunk.slice(0, -1);
                  } else if (chunk.endsWith('\n') && !modifiedChunk.endsWith('\n')) {
                    modifiedChunk += '\n';
                  }


                  
                  const mathBufferlines = modifiedChunk.split('\n');

                  mathBufferlines.forEach(line => {
                    if (line.startsWith('data: ')) {
                      const jsonStr = line.slice(6);
                      try {
                        const parsed = JSON.parse(jsonStr);
                        if (parsed.token) {
                          mathBuffer = mathBuffer + parsed.token;
                        }
                      } catch {

                      }
                    }
                  })  

                  if (mathModeOn || mathBuffer.includes('$')){
                    
                    if (mathBuffer.length < 250 && !mathBuffer.includes("[DONE]")){
                      //just keep reading to keep adding to the maths buffer
                    } else {
                      mathBuffer = mathBuffer.replace(/([\s.(,"'])\$([^$]+)\$([\s.),"])/g, '$1$$$$$2$$$$$3');
                      if (mathBuffer.includes("[DONE]")){
                        mathBuffer = mathBuffer.replace("[DONE]","")
                      }
                      let mathModifiedChunk = '\nevent:delta\ndata: {\"token\": '+JSON.stringify(mathBuffer)+'}\n\n';
                      controller.enqueue(encoder.encode(mathModifiedChunk));
               
                      mathBuffer = '';
                    }

                  } else {
                    // Encode and send the modified chunk
                    controller.enqueue(encoder.encode(modifiedChunk));
         
                    mathBuffer = '';
                  }
                  

                    
                    // Continue reading
                  pump();
                } catch (error) {
              
                  // Clean up abort listener if it exists
                  if (abortSignal) {
                    abortSignal.removeEventListener('abort', handleAbort);
                  }
                  
                  // Propagate the error
                  if (error.name === 'AbortError' || isAborted) {
                    controller.error(new DOMException('Aborted', 'AbortError'));
                  } else {
                    controller.error(error);
                  }
                }
              }
              
              pump();
            },
            
            cancel(reason) {
      
              isAborted = true;
              
              // Cancel the underlying reader
              return reader.cancel(reason).catch(err => {
          
              });
            }
          });
          
          // Create a new Response with our stream and the original headers
          const newResponse = new Response(newStream, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
          
     
          return newResponse;
        }
      }
      
      // Return the original response for non-SSE endpoints
      return response;
    });
};


let originalFetch = window.fetch;

// Overwrite the global fetch function
window.fetch = async function(...args) {

    const [url, config] = args;

   

    if (url.includes("https://core-pickaxe-api.pickaxe.co/submit")){   //Massive if{} to get the formid,responseid,lastmessage,documents

        try {
            // Extract from request body
            formId = JSON.parse(config.body).pickaxeId
        } catch(e){}
        try {
            responseId = JSON.parse(config.body).sessionId
        } catch(e){}
        try {
            latestRequest = JSON.parse(config.body).value
        } catch(e){}
        try {
            studioUserId = JSON.parse(config.body).sender
        } catch(e){}
        try {
            documents = JSON.parse(config.body).documentIds
        } catch(e){}


        try {
            const response = await originalFetch(url, config);
            const responseClone = response.clone();
            
            // Extract submissionId from response
            const responseData = await responseClone.json();
            if (responseData.submissionId) {
                currentSubmissionId = responseData.submissionId;
                console.log("Captured submissionId:", currentSubmissionId);
            }
            
            return response;
        } catch (error) {
            console.error("Error in /submit:", error);
            return await originalFetch(url, config);
        }
    }
     
    if (url.includes("https://core-pickaxe-api.pickaxe.co/stream")){

    
        currentAbortController = new AbortController();
        const signal = currentAbortController.signal;
       

        try {  
        setTimeout(() => {
            addEditButton();
          }, 2000);
        const response = await originalFetch(url, { ...config, signal }); //Original fetch
        const out = response.clone(); // return this to your UI
        

       (async () => {
            try {
                const r = out.body.getReader();
                while (!(await r.read()).done) {}
        
                // *** IMPORTANT FIX ***
                currentAbortController = null;
        
                errorMessageHandler();
                setTimeout(() => {
                    syncConversation(responseId, formId, studioUserId, pastedContent, url);
                }, 2000);
                console.log("sync conversation with:", "res ",responseId,"for ",formId, "stud",studioUserId)
            } catch (_) {}
        })();




        return response;

        } catch (error) {

      
        stopButtonOff()

        }
    
    } 
    else {
        return await originalFetch(url, {...config});
    }
};


function stopStream() {
    if (currentAbortController) { //stops the stream
        currentAbortController.abort();
 
    }

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

    setTimeout(function(){ //waits 50ms for the "error message" to load
       
        var errBox = document.querySelector('div.text-\\[14px\\].max-\\[1024px\\]\\:text-\\[14px\\].max-\\[899px\\]\\:text-\\[14px\\].font-semibold'); //gets the "error message"
        if(errBox){
        
            errBox.textContent = "This response was stopped by the user.";
        }
        var allMsgs = document.querySelectorAll('div.gap-y-3.text-left');
        var lastMsg = allMsgs[allMsgs.length-1]
        lastMsg.style.backgroundColor = 'rgba(200, 200, 200, 0.5)';  //makes last message gray
        
          const p = document.createElement('p');
          p.setAttribute('align', 'right');

          // small tag for smaller text
          const small = document.createElement('small');
          small.textContent = 'Stopped';
          small.style.color = 'grey';
          p.appendChild(small);

        lastMsg.appendChild(p);

    }, 100); 
}


function addEditButton() {
    var allMsgs = document.querySelectorAll('div.gap-y-3.text-left');
    var lastMsg = allMsgs[allMsgs.length - 1];
 
    const messageDiv = lastMsg;

    // Button container with fade-in animation
    const buttonHTML = `
      <div class="flex h-4 items-center justify-end gap-3 edit-btn-wrapper" 
           style="">
        <button id="edit-button" 
          class="flex items-center gap-1 opacity-70 outline-none transition-opacity duration-300 ease-in-out hover:opacity-100"
          style="color: rgb(0, 0, 0);">
          
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="w-4 h-4 shrink-0">
            <path fill="grey"
              d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z">
            </path>
          </svg>

        </button>
      </div>
    `;

    messageDiv.closest("div.flex.gap-x-3").classList.add('flex-col');
    messageDiv.insertAdjacentHTML('afterend', buttonHTML);

    const wrapper = messageDiv.nextElementSibling;
    const editButton = wrapper.querySelector('#edit-button');

    // Fade it in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            wrapper.classList.add("edit-btn-visible");
        });
    });


    editButton.addEventListener('click', function () {
        const markdownDiv = messageDiv.querySelector('.pxe-markdown');
          if (!markdownDiv) return;

        const text = markdownDiv.innerText.trim();
        const txtBox = document.querySelector('#studio-root textarea.resize-none');

        if (txtBox) {
            const setter = Object.getOwnPropertyDescriptor(
                window.HTMLTextAreaElement.prototype,
                'value'
            ).set;
            setter.call(txtBox, text);
            txtBox.dispatchEvent(new Event('input', { bubbles: true }));
        }
        

        // ---- NEW LOGIC ----
        const messageStillGenerating = currentAbortController !== null;
        if (messageStillGenerating) stopStream();
    });
}







// ============= XHL Replacing Characters

const originalXHR2 = XMLHttpRequest;


XMLHttpRequest = function() {
  const xhr = new originalXHR2();
  
  const PATTERN_REPLACEMENTS = {
    /*
    '\\\\[': '\\n $$ \\n',     // Replace \[ with $$
    '\\\\]': '\\n $$ \\n',     // Replace \] with $$
    '\\\\(': ' $$',     // Replace \( with $$
    '\\\\)': ' $$ ',     // Replace \) with $$
    */
    '<think>':'<div id=\'reason\' class=\'reasoning\'>',
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
      if (requestUrl && requestUrl.startsWith('https://core-pickaxe-api.pickaxe.co/conversation') && originalResponse) {
        // Apply all pattern replacements using simple string replacement
        let modifiedResponse = originalResponse;
        for (const [pattern, replacement] of Object.entries(PATTERN_REPLACEMENTS)) {
          modifiedResponse = modifiedResponse.replaceAll(pattern, replacement);
        }

        modifiedResponse = modifiedResponse.replace(/([\s.(,"'])\$([^$]+)\$([\s.),"])/g, '$1$$$$$2$$$$$3');
        
        // Log right before returning
        
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

    interceptedUrl = url; // Store the URL for later use
    return originalOpen.apply(this, [method, url, ...rest]);
    };

    const originalSend = xhr.send;
    xhr.send = function(body) {

    if (interceptedUrl.includes("https://core-api.pickaxe.co/feedback")) {   
  
        
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
