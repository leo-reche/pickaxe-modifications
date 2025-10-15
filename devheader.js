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


let originalFetch2 = window.fetch;

window.fetch = function(input, init) {
  const url = typeof input === 'string' ? input : input.url;
  
  return originalFetch2.call(this, input, init)
    .then(response => {
      // Check if this is the specific SSE endpoint we want to log
      if (url === 'https://core-api.pickaxe.co/pickaxe/sse') {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('text/event-stream')) {
          console.log("SSE fetch called - creating pass-through stream");
          
          // PATTERNS CONFIGURATION - Now a dictionary/object
          const PATTERN_REPLACEMENTS = {
                '\\[': '\n $$ \n',     // Replace \[ with $$
                '\\]': '\n $$ \n',     // Replace \] with $$
                '\\(': ' $$ ',     // Replace \( with $$
                '\\)': ' $$ ',     // Replace \) with $$
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
          
          console.log("Stream started - Pattern replacements configured:", PATTERN_REPLACEMENTS);
          
          // Create a new ReadableStream that will process and pass through the data
          const newStream = new ReadableStream({
            async start(controller) {
              console.log("New stream controller started");
              
              // Set up abort handler if signal exists
              const handleAbort = () => {
                console.log("Abort signal received - cleaning up stream");
                isAborted = true;
                
                try {
                  // Cancel the reader
                  reader.cancel().catch(err => {
                    console.log("Reader cancel error (may be already closed):", err);
                  });
                  
                  // Close the controller with an abort error
                  controller.error(new DOMException('Aborted', 'AbortError'));
                } catch (err) {
                  console.log("Error during abort handling:", err);
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
                  if (isAborted) {
                    console.log("Stream aborted, stopping pump");
                    return;
                  }
                  
                  const { done, value } = await reader.read();
                  
                  if (done) {
                    console.log("Stream ended");
                    if (partialBuffer) {
                      console.log("Remaining partial buffer:", partialBuffer);
                    }
                    
                    // Clean up abort listener if it exists
                    if (abortSignal) {
                      abortSignal.removeEventListener('abort', handleAbort);
                    }
                    
                    controller.close();
                    return;
                  }
                  
                  // Check again after read in case abort happened during read
                  if (isAborted) {
                    console.log("Stream aborted after read, stopping");
                    return;
                  }
                  
                  // Decode the chunk
                  const chunk = decoder.decode(value, { stream: true });
                  console.log("Processing chunk of length:", chunk.length);
                  
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
                              
                              console.log("Pattern: ",pattern," found in token: ",modifiedToken, ". Replacing...")
                              patternsFound = true;
                              // Replace all instances of the pattern with its specific replacement
                              modifiedToken = modifiedToken.split(pattern).join(replacement);
                              console.log("Token After Replacement: ", modifiedToken)
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
                                  console.log(`Token ends with partial pattern '${partialPattern}'`);
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
                        mathBuffer.replace("[DONE","")
                      }
                      let mathModifiedChunk = '\nevent:delta\ndata: {\"token\": '+JSON.stringify(mathBuffer)+'}\n\n';
                      controller.enqueue(encoder.encode(mathModifiedChunk));
                      console.log("Math modified chunk sent. Here you see it:", mathModifiedChunk);
                      mathBuffer = '';
                    }

                  } else {
                    // Encode and send the modified chunk
                    controller.enqueue(encoder.encode(modifiedChunk));
                    console.log("Modified chunk sent, see it here:",modifiedChunk);
                    mathBuffer = '';
                  }
                  

                    
                    // Continue reading
                  pump();
                } catch (error) {
                  console.log("Error in pump:", error);
                  
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
              console.log("Stream cancelled with reason:", reason);
              isAborted = true;
              
              // Cancel the underlying reader
              return reader.cancel(reason).catch(err => {
                console.log("Reader cancel error:", err);
              });
            }
          });
          
          // Create a new Response with our stream and the original headers
          const newResponse = new Response(newStream, {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
          });
          
          console.log("Returning new response with modified stream");
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
    '\\\\[': '\\n $$ \\n',     // Replace \[ with $$
    '\\\\]': '\\n $$ \\n',     // Replace \] with $$
    '\\\\(': ' $$',     // Replace \( with $$
    '\\\\)': ' $$ ',     // Replace \) with $$
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
      if (requestUrl && requestUrl.startsWith('https://core-api.pickaxe.co/pickaxe/chat/conversation') && originalResponse) {
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
