var chromeTabSender=chrome.tabs.sendMessage;if(typeof chromeTabSender!="function"){chromeTabSender=chrome.tabs.sendRequest}var webRequestCache={};function addToWebRequestCache(a,b){if(typeof webRequestCache[a]=="object"){webRequestCache[a]=$.merge(webRequestCache[a],b)}else{webRequestCache[a]=b}}chrome.webRequest.onCompleted.addListener(function(c){var b=c.url;var a=c.tabId;if(a==-1){return}},{urls:["<all_urls>"]},["responseHeaders"]);function clearCache(){chrome.tabs.query({},function(c){var d=[];for(var b=0;b<c.length;b++){d.push(c[b].id)}for(var a in webRequestCache){if(webRequestCache.hasOwnProperty(a)){if($.inArray(parseInt(a),d)==-1){delete webRequestCache[a]}}}})}setInterval(clearCache,10*60*1000);var GET_IMAGE_TYPE={CURRENT:0,ALL_TAB:1};function getOuputTab(a){chrome.tabs.query({url:chrome.extension.getURL("output.html"),windowId:chrome.windows.WINDOW_ID_CURRENT},function(b){if(b.length==0||localStorage.oneOutput=="0"){chrome.tabs.create({url:chrome.extension.getURL("output.html")},function(c){a.callback(c)})}else{a.callback(b[0])}})}function getTabImage(a){var b={};if(a.type==GET_IMAGE_TYPE.CURRENT){b={active:true,windowId:chrome.windows.WINDOW_ID_CURRENT}}else{if(a.type==GET_IMAGE_TYPE.ALL_TAB){b={windowId:chrome.windows.WINDOW_ID_CURRENT}}else{alert("出错啦！");return}}chrome.tabs.query(b,function(d){if(d.length==0){alert("没有标签啊？！");return}localStorage.title=d[0].title;localStorage.url=d[0].url;var c=getHost(d[0].url);_gaq.push(["_trackEvent","getTagImage",c,d[0].title,null,false]);chrome.browserAction.setBadgeText({text:"load"});getOuputTab({callback:function(e){chrome.tabs.highlight({windowId:e.windowId,tabs:[e.index]},function(){});var h=e.id;console.log("outputTabId",h);for(var f=0;f<d.length;f++){var g=d[f];getImage(g,h)}}})})}function getHost(b){var d=null;var c=/.*\:\/\/([^\/]*).*/;var a=b.match(c);if(typeof a!="undefined"&&null!=a){d=a[1]}return d}function getImage(c,d){var b={rules:G_CONFIG.getRules(),outputTabId:d};var e=JSON.stringify(b,null,null);var a=c.id;chrome.tabs.executeScript(a,{file:"js/content2.js",allFrames:true},function(){var f="imageManager.getImage("+e+");";chrome.tabs.executeScript(a,{code:f,allFrames:true},function(){var h=webRequestCache[a];if(typeof h=="object"){console.log("thisTabCache.length",h.length);var g=[];$.each(h,function(j,k){g.push({type:"IMG",src:k,width:0,height:0})});chromeTabSender(d,{cmd:"ADD_PIC",imgList:g},function(i){});delete webRequestCache[a]}chrome.browserAction.setBadgeText({text:""})})})}function getCurrentTabImage(){getTabImage({type:GET_IMAGE_TYPE.CURRENT})}function getAllTabImage(){getTabImage({type:GET_IMAGE_TYPE.ALL_TAB})}function translateUrl(r){var n=[];var g=[];var h=/^https?:\/\/.*$/;var o=/^(.*)\[(.*?)\](.*)$/;var a=/\d+-\d+/;var j;var d=r.match(o);if(d){var l=d[1];var s=d[2];var c=d[3];var b=s.split(",");for(var m=0;m<b.length;m++){var e=b[m];if(e.indexOf("-")>0){var q=e.split("-")[0];var p=e.split("-")[1];if(a.test(e)){for(var f=parseInt(q);f<=parseInt(p);f++){g.push("00000".substr(0,q.length-(""+f).length)+f)}}else{for(var k=q.charCodeAt(0);k<=p.charCodeAt(0);k++){g.push(String.fromCharCode(k))}}}else{g.push(e)}}for(var m=0;m<g.length;m++){n.push(l+g[m]+c)}}else{if(r.match(h)){n.push(r)}}return n}function openPage(a){if(a.length<1){return}var b=[];$(a).each(function(c,f){if(f!=""){var d=translateUrl(f);for(var e=0;e<d.length;e++){b.push(d[e]);chrome.tabs.create({url:d[e]})}}})}chrome.browserAction.onClicked.addListener(function(a){getCurrentTabImage()});function myOnMessage(d,b,a){switch(d.cmd){case"ADD_PIC":var f=d.imgList;var e=d.outputTabId;chromeTabSender(e,{cmd:"ADD_PIC",imgList:f},function(g){});a({});break;case"IS_USE_HOTKEY":if(localStorage.useHotkey==undefined){localStorage.useHotkey="1"}a({on:localStorage.useHotkey=="1"});break;case"GET_CURRENT_TAB_IMAGE":getCurrentTabImage();a({});break;case"GET_ALL_TAB_IMAGE":getAllTabImage();a({});break;case"OPEN_PAGE":var c=d.pageUrls;openPage(c);a({});break}}function isNeedUpdateRule(){var b=localStorage.ruleLastUpdateTime;var c=new Date(b);var a=new Date();c.setSeconds(c.getSeconds()+1);if(b==undefined||c<a){return true}return false}var reciver=chrome.extension.onMessage;if(reciver==undefined){reciver=chrome.extension.onRequest}reciver.addListener(function(c,b,a){myOnMessage(c,b,a)});$(function(){if(isNeedUpdateRule()){console.log("updateCommonRule");G_CONFIG.updateCommonRule()}$.getJSON(chrome.extension.getURL("manifest.json"),function(c){var b=c.version;_gaq.push(["_trackEvent","version",b,null,null,false]);var a=localStorage.version;if(a==null||a!=b){localStorage.version=b}})});