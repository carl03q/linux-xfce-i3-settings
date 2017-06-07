

    //var host="http://chromeshutter.appspot.com";
    var host="http://localhost:8888";
    var expandedId="";
    var scrollTop=0;
    
    function getDomain(url) {
        try{
        return url.match(/:\/\/(.[^/]+)/)[1];
        }catch(err){
        return "(unknown domain)";
        }
    }
    function colapseNode(id){
        var node = document.getElementById("snap" + id);
        if(!node)
                return;
        if(node.getAttribute("expanded")=="true")
        {
            node.className="snap";
            var expander = document.getElementById("exp" + id);
            expander.style.backgroundPosition = "0";
            var entry = document.getElementById("entry" + id);
            entry.parentNode.removeChild(entry);
            node.setAttribute("expanded","false");
            expandedId="";
            
        }
    
    }
    function toggleNode(id) {
        var node = document.getElementById("snap" + id);
        if(!node)
                return;
        var expaded=node.getAttribute("expanded");
        if(expaded=="true")
        {
            colapseNode(id);
        }
        else
        {
            expandNode(id);
        }
    }
    
    function expandNode(id) {
        var node = document.getElementById("snap" + id);
        if(!node)
                return;
        var oldExpandId= expandedId;
        
        
        if(oldExpandId.length>1 && id!=oldExpandId)
        {
            colapseNode(oldExpandId);
        }
        node.setAttribute("expanded","true");
        node.className= "snap expanded";
        var urls = node.getAttribute("urls");
        var urlList = urls.split('@,@');
        var expander = document.getElementById("exp" + id);
        
        expander.style.backgroundPosition = "-14px";
        var container = document.createElement("div");
        container.className = "entry";
        container.id = "entry" + id;
        for (var i = 0, u; u = urlList[i]; i++) {
            
            var entry = document.createElement("div");
            entry.className = "entry-box";
            var checkbox = document.createElement("input");
            checkbox.setAttribute("type","checkbox");
            checkbox.setAttribute("url",u);
            checkbox.name="chkurl";
            entry.appendChild(checkbox);
            
            var title = document.createElement("div");
            title.className = "title";
            title.style.backgroundImage = "url('http://www.google.com/s2/favicons?domain= " + getDomain(u) + "')";  //chrome://favicon/http://chromeshutter.appspot.com/"; 
            var a = document.createElement("a");
            a.href = u;
            a.title = u;
            a.innerHTML = getDomain(u);
            a.target = "_blank";
            var trash=document.createElement("button");
            trash.title="Remove from snapshot";
            trash.onclick =Function("removeUrl('"+id+"','"+ i +"')"); 
			//trash.addEventListener('click', function(){removeUrl(id,i)});
            trash.className="trash";
            title.appendChild(a);
            entry.appendChild(trash);
            entry.appendChild(title);
            container.appendChild(entry);
        }
        node.appendChild(container);
        expandedId=id;

    }
    function getUrlsFromIndexes(id,indexes){
        var node = document.getElementById("snap" + id);
            var urls = node.getAttribute("urls");
            var urlList = urls.split('@,@');
            urls='';
            for (var j = 0, index; index= indexes[j]; j++) {
                    urls+= urlList[index]+'@,@';
            }
            if (urls.length > 2) urls = urls.substring(0, urls.length - 3);
            
        return urls;
    }
    function getUrlsExceptIndexes(id,indexes){
        var node = document.getElementById("snap" + id);
            var urls = node.getAttribute("urls");
            var urlList = urls.split('@,@');
            urls='';
            var i=0;
            for (var j = 0, u; u= urlList[j]; j++) {
                    if(j!=indexes[i])
                        urls+= urlList[j]+'@,@';
                    else
                       i++; 
            }
            if (urls.length > 2) urls = urls.substring(0, urls.length - 3);
            
        return urls;
    }    
    function removeUrl(id, strIndexes){
        var indexes= strIndexes.split(",");
        var urls= getUrlsExceptIndexes(id,indexes);        
        saveCurrentPos();
        var bkg = chrome.extension.getBackgroundPage();
        bkg.addTabUrl(id, urls, '',"refresh");
    }
    function saveCurrentPos(){
        
        var element=document.getElementById("snapsList");
        scrollTop=element.scrollTop;
    
    }
    function loadCurrentPos() {
        
        var element=document.getElementById("snapsList");
        if(expandedId)
        {
            expandNode(expandedId);
        }
        element.scrollTop=scrollTop;

	}

    function initHintTextboxes() {
        var input = document.getElementById('snapshotName');
        input.focus();
        input.hintText = input.value;
        input.className = "hintTextbox";
        input.onfocus = onHintTextboxFocus;
        input.onblur = onHintTextboxBlur;
    }

    function onHintTextboxFocus() {
        var input = document.getElementById('snapshotName');
        if (input.value == input.hintText) {
            input.value = "";
            input.className = "hintTextboxActive";
        }
    }

    function onHintTextboxBlur() {
        var input = document.getElementById('snapshotName');
        if (input.value.trim().length == 0) {
            input.value = input.hintText;
            input.className = "hintTextbox";
        }
    }

    function showTabs(req) {
    
        if (req.responseXML == null) return;
        var divFrame = document.getElementById("frame");
        removeInsideTag(divFrame);
        var divSnapList = document.createElement("div");
        divSnapList.className = "snaps";
        divSnapList.id = "snapsList";
              
        var nodeMsg = req.responseXML.getElementsByTagName("msg");
        
        if (nodeMsg != null && typeof nodeMsg != "undefined") {
		        	
            for (var i = 0, node; node = nodeMsg[i]; i++) {
            			
        			showMsg(divFrame, node);        
            }
        }

        var nodes = req.responseXML.getElementsByTagName("snapshot");
        if (nodes[0] != null && typeof nodes != "undefined") {
            divFrame.appendChild(divSnapList);
            for (var i = 0, node; node = nodes[i]; i++) {
				drawSnapshot(divSnapList,node);
            }
        }
        
        var nodeIn = req.responseXML.getElementsByTagName("signin");
        if (nodeIn[0] != null && typeof nodeIn != "undefined") {
            var a = document.createElement("a");
            a.href = nodeIn[0].getAttribute("href");
            a.innerHTML = "Sign In";
            a.target = "_blank";
            a.className = "signin-box";
            
            var divkeyin = document.getElementById("keyin");
            removeInsideTag(divkeyin);
            divkeyin.innerHTML = "Welcome, <b>Tab Shutter</b> is integrated with your Google account.<br><br>"
            divFrame.appendChild(a);
        }
        var nodeOut = req.responseXML.getElementsByTagName("signout");
        if (nodeOut[0] != null && typeof nodeOut != "undefined") {
            var a = document.createElement("a");
            a.href = "javascript:signOut('" + nodeOut[0].getAttribute("href") + "')";
            a.innerHTML = "Sign Out";
            a.className="signout";
            divFrame.appendChild(a);
        }
        var nodeToolbar = req.responseXML.getElementsByTagName("toolbar");
        if (nodeToolbar[0] != null && typeof nodeToolbar != "undefined") {
            var ul = document.createElement("ul");
            ul.className = "toolbar";
            for (var i = 0, node; node = nodeToolbar[i]; i++) {
                var li = document.createElement("li");
                var a = document.createElement("a");
                a.href = node.getAttribute("href");
                a.target = "parent";
                a.innerHTML = node.getAttribute("value");
                a.title = node.getAttribute("caption");
                li.appendChild(a);
                ul.appendChild(li);
            }
            divFrame.appendChild(ul);
        }
        loadCurrentPos();
    }
	function drawSnapshot(divSnapList, node){
			    var divSnap = document.createElement("div");
                divSnap.className = "snap";
                divSnap.id = "snap" + node.getAttribute("id");
                node.setAttribute("expanded","false");
                divSnap.setAttribute("urls",node.getAttribute("url"));
                divSnapList.appendChild(divSnap);
                var del = document.createElement("a");

				//************ TREE ***************
				var expandbtn=document.createElement("button");
				expandbtn.className="expander";
				expandbtn.setAttribute("name","expandbtn");
				expandbtn.id="exp"+node.getAttribute("id");
				expandbtn.onclick =Function("toggleNode('"+node.getAttribute("id")+"')"); 
				
				divSnap.appendChild(expandbtn);
				
				//*********** DROP BOX **************
				var ddmenu = document.createElement("div");
                ddmenu.className = "dropboxmenu";
				ddmenu.id="menu"+node.getAttribute("id");
				ddmenu.setAttribute("name","dropboxmenu");
			
				
				var menubtn=document.createElement("button");
				menubtn.className="drop-down";
				menubtn.setAttribute("name","dropboxbtn");
				menubtn.id="btn"+ddmenu.id;
				menubtn.onclick =Function("showDropbox('"+ddmenu.id+"')"); 
				divSnap.appendChild(menubtn);

				
				divSnap.appendChild(ddmenu);
				

                var t = node.getAttribute("date");
                var date = new Date(t).toLocaleString()
                date = date.substr(0, date.indexOf("GMT"));
                var a = document.createElement("a");
                a.innerHTML = node.getAttribute("Title");
                a.id = "title" + node.getAttribute("id");
                a.href = "javascript:openTabs(false,'"+node.getAttribute("id")+"')";
                a.urls = node.getAttribute("url");
                divSnap.appendChild(a);
                var spanUser = document.createElement("span")
                spanUser.innerHTML = node.getAttribute("user");
                divSnap.appendChild(spanUser);
                var badge = document.createElement("span");
                badge.innerHTML = "(" + node.getAttribute("url").split('@,@').length + " Tabs)";
                badge.className = "badge";
                
                
                var divDate = document.createElement("div");
                
                divDate.innerHTML = "<div class='date'>" + date + "</div>";
                divDate.appendChild(badge);
                
                divSnap.appendChild(divDate);
	}
	function getCheckedIndexes(node){
		if(node.getAttribute("expanded")=="true")
		{
		    var indexes="";
		    var checkboxes=document.getElementsByName("chkurl");
		    for (var i=0,c; c=checkboxes[i];i++)
		    {
		        if(c.checked)
		        indexes+=i+",";
		    } 
		    if(indexes.length>1) indexes=indexes.substring(0, indexes.length - 1);
		    return indexes;
		}
        return null;	    
	}	
	function createDropbox(id,ddmenu){
	            var node = ddmenu.parentNode;
	            var indexes=getCheckedIndexes(node);
				if( indexes)
				{
				    
                    var openSel = document.createElement("a")
                    openSel.innerHTML = "<img src='null.png' title='Open selected items' ><span>Open selected items</span>";
                    openSel.href = "javascript:openSelectedTabs(false,'"+ id + "','" + indexes + "')";
				    openSel.className="item";
                    ddmenu.appendChild(openSel);
                    
				// Menu Devider
				var devider= document.createElement("div");
				devider.className="devider";
                ddmenu.appendChild(devider);
                
                    // Menu Item Remove
                    var item = document.createElement("a");
                    item.innerHTML = "<img src='trash.png' title='Remove selected items' alt='remove' style='opacity:0.55'><span>Remove selected items...</span>";
                    item.className = "item";
                    item.href = "javascript:confirmSelectedRemove('"+ id +"','"+ indexes + "')";
                    ddmenu.appendChild(item);
                    
                    
				// Menu Devider
				var devider= document.createElement("div");
				devider.className="devider";
                ddmenu.appendChild(devider);
                
                    // Share gmail
                    var item = document.createElement("a");
                    item.innerHTML = "<img src='icon_email.gif' title='Send to email' alt='email' style='opacity:.55' ><span>Send selected to email...</span>";
                    item.className = "item";
                    var indexList=indexes.split(",");
                    item.href = "javascript:sendToGmail('" + getUrlsFromIndexes(id,indexList)+ "')";
                    ddmenu.appendChild(item);
                    
                    return;
				}
				
				// Menu Item New Window
                var aNew = document.createElement("a")
                aNew.innerHTML = "<img  src='newwindow.gif' title='Open in new window'  /><span>Open in new window</span>";
                aNew.href = "javascript:openTabs(true,'" + id + "')";
				aNew.className="item";
                ddmenu.appendChild(aNew);
                
                
				// Menu Devider
				var devider= document.createElement("div");
				devider.className="devider";
                ddmenu.appendChild(devider);
				
				
				// Menu Item Append
                var itemAppend = document.createElement("a");
                itemAppend.innerHTML = "<img src='add.gif' title='Add selected Tabs to this Snapshot' alt='Append' style='opacity:0.55'><span>Add highlighted tabs</span>";
                itemAppend.className = "item";
                itemAppend.href = "javascript:appendTabs('" + id + "')";
                ddmenu.appendChild(itemAppend);
				
				//// Menu Item Update
                var itemUpdate= document.createElement("a");
                itemUpdate.innerHTML = "<img src='update.png' title='Update this Snapshot' alt='Update' style='opacity:0.75'  ><span>Update snapshot</span>";
                itemUpdate.className = "item";
                itemUpdate.href = "javascript:updateSnapshot('" + id + "')";
                ddmenu.appendChild(itemUpdate);
                
				// Menu Item Remove
                var item = document.createElement("a");
                item.innerHTML = "<img src='trash.png' title='Remove this Snapshot' alt='remove' style='opacity:0.55'><span>Remove snapshot...</span>";
                item.className = "item";
                item.href = "javascript:confirmSnapshot('" + id + "')";
                ddmenu.appendChild(item);
                
                
				// Menu Devider
				var devider= document.createElement("div");
				devider.className="devider";
                ddmenu.appendChild(devider);

                var item = document.createElement("a");
                item.innerHTML = "<img src='icon_email.gif' title='Send to email' alt='email' style='opacity:.55' ><span>Send to email...</span>";
                item.className = "item";
                var urls = node.getAttribute("urls");
                item.href = "javascript:sendToGmail('" + urls + "')";
                ddmenu.appendChild(item);
				
	}
	function sendToGmail(urls){
	    var mailto= "mailto:?subject=Check out links&body="; //"https://mail.google.com/mail/?view=cm&tf=1&fs=1&su=Checkout links&body=";
	    urls="Please check out following link(s):"+encodeURIComponent("\n\t"+urls.replace(/@,@/gi,"\n\t"));
	    mailto+=urls;
	    window.open(mailto);
	}
	function hideDropbox(e){
		var menus=document.getElementsByName("dropboxmenu");
		var menubtns=document.getElementsByName("dropboxbtn");
		var ddbtnClicked=-1;
		for(var i=0, m , b ;  m=menus[i];i++)
		{
			b=menubtns[i];
			var target=e?e.target:event.srcElement;
			if(target==b) 
				ddbtnClicked=i;
		}		
		
		if(ddbtnClicked<0)
		{
			for(var i=0, m ; m=menus[i];i++)
			{
				m.style.visibility="hidden";
	
			}					
		}
	}
	document.onclick=hideDropbox;
	function showDropbox(id){
		
        
		var menu=document.getElementById(id);
		var node=menu.parentNode;			
		
		var ddbtn=document.getElementById("btn"+id);
		var menus=document.getElementsByName("dropboxmenu");
		var menubtns=document.getElementsByName("dropboxbtn");
                if(menu!=null)
				{
					for(var i=0, m ,b ; m=menus[i];i++)
					{
						b=menubtns[i];
						m.innerHTML="";
						m.style.visibility="hidden";
					}		
					var id=node.id.replace("snap","");
		            createDropbox(id,menu);			
              		menu.style.visibility="visible";
				}
	}
	function requestNotification(){
        var req = new XMLHttpRequest();
        req.open("GET", host + "/notify", true);
        req.onreadystatechange = function () {
            if (req.readyState > 3) {
                if (req.status == 200) {
                    showNotify(req);
                    return true;
                }
            }
        };
        req.send(null);

	}
    function showNotify(req) {
    	
        if (req.responseXML == null) return;
        var nodes = req.responseXML.getElementsByTagName("notify");

        var parent=document.getElementById("notification");
        if (parent != null ) {
        	
            parent.innerHTML="";
            for (var i=0,node;node=nodes[i];i++ )
            	{
            	
		            var divNotify = document.createElement("div");
		            divNotify.setAttribute("id","notify"+node.getAttribute("id"));
		            var divClose= document.createElement("div");
		            divClose.setAttribute("onclick","closeNotify('"+ node.getAttribute("id") +"')");
		            divClose.className="close";
		            
				    divNotify.appendChild(divClose);
				    var spanBody=document.createElement("span");
				    spanBody.innerHTML=node.getAttribute("body");
				    divNotify.appendChild(spanBody);
		            var type = node.getAttribute("type");
		            if (type == 'warning') divNotify.className = "notify warning";
		            if (type == 'critical') divNotify.className = "notify critical";
		            if (type == 'info') divNotify.className = "notify info";
		            if (type == 'facebook') divNotify.className = "notify facebook";
		            if (type == 'gplus') divNotify.className = "notify gplus";
		            divNotify.style.display="block";
		            parent.appendChild(divNotify);
            	}
            
            
        }
    }

    function signOut(url) {
        var req = new XMLHttpRequest();
        
        req.open("POST", url, true);
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                window.close();
            }
        };
        req.send(null);
    }

    function openTabs(newWin,id) {
        saveCurrentPos();
        if (newWin) {
            win = chrome.windows.create();
        }
        var bkg = chrome.extension.getBackgroundPage();
        var snap=document.getElementById("snap"+id);
        bkg.openTabs(snap.getAttribute("urls"));
    }
    function openSelectedTabs(newWin,id,strIndexes) {
        saveCurrentPos();
        if (newWin) {
            win = chrome.windows.create();
        }
        var bkg = chrome.extension.getBackgroundPage();
        var indexes=strIndexes.split(",");
        bkg.openTabs(getUrlsFromIndexes(id,indexes));
    }

    function iceTabs() {
        scrollTop=0;
        var bkg = chrome.extension.getBackgroundPage();
        bkg.addSelectedTabs(document.getElementById('snapshotName').value );
    }
    function appendTabs(id) {
        saveCurrentPos();
        var bkg = chrome.extension.getBackgroundPage();
        bkg.appendSelectedTabs(id );
        
        
    }

    function showMsg(parent, node) {
        if (parent != null && node != null) {
            var divConfirm = document.createElement("div");
            divConfirm.innerHTML = "<span>" + node.getAttribute("desc") + "</span>";
            var buttons = node.getElementsByTagName('button');
            if (buttons != null) {
                for (var i = 0, btn; btn = buttons[i]; i++) {
                    var a = document.createElement("a");
                    a.href = btn.getAttribute("href");
                    a.innerHTML = btn.getAttribute("caption");
                    a.title = btn.getAttribute("title");
                    a.target = btn.getAttribute("target");
                    divConfirm.appendChild(a);
                }
            }
            divConfirm.id = "msg" + node.getAttribute("id");
            var type = node.getAttribute("type");
            if (type == 'warning') divConfirm.className = "WarningBox";
            if (type == 'critical') divConfirm.className = "criticalBox";
            if (type == 'info') divConfirm.className = "infoBox";
            parent.appendChild(divConfirm);
        }
    }
    function showInternalMsg(code) {
	        var parent = document.getElementById("frame");
	        removeInsideTag(parent);
    	
        if (parent != null ) {
            var divConfirm = document.createElement("div");
            divConfirm.innerHTML = "<span>" + "Unknown Error, please try again. Error Code: " +code + "</span>";
                    var a = document.createElement("a");
                    a.href = "#";
                    a.innerHTML = "Close";
                    a.title = "";
                    a.target = "";
                    divConfirm.appendChild(a);
                    divConfirm.id = "msgerror" ;
                    var type = node.getAttribute("type");
                    divConfirm.className = "criticalBox";
                    parent.appendChild(divConfirm);

            }
        }
    

    function confirmSnapshot(id) {
        var divSnap = document.getElementById("snap" + id);
        if (divSnap != null) {
            var divConfirm = document.createElement("div");
            var btnOk = document.createElement("a");
            var btnCancel = document.createElement("a");
            btnOk.href = "javascript:removeSnapshot('" + id + "')";
            btnOk.innerHTML = "Yes";
            btnCancel.href = "javascript:cancelRemoveSnapshot('" + id + "')";
            btnCancel.innerHTML = "Cancel";
            divConfirm.id = "confirm" + id;
            divConfirm.innerHTML = "<span>Are you sure?</span>"
            divConfirm.appendChild(btnCancel);
            divConfirm.appendChild(btnOk);
            divConfirm.className = "RemoveBox";
            divSnap.appendChild(divConfirm);
            return;
        }
    }
    function confirmSelectedRemove(id,indexes) {
        var divSnap = document.getElementById("snap" + id);
        if (divSnap != null) {
            var divConfirm = document.createElement("div");
            var btnOk = document.createElement("a");
            var btnCancel = document.createElement("a");
            btnOk.href = "javascript:removeUrl('"+id+"','"+ indexes +"')";
            btnOk.innerHTML = "Yes";
            btnCancel.href = "javascript:cancelRemoveSnapshot('" + id + "')";
            btnCancel.innerHTML = "Cancel";
            divConfirm.id = "confirm" + id;
            divConfirm.innerHTML = "<span>Are you sure?</span>"
            divConfirm.appendChild(btnCancel);
            divConfirm.appendChild(btnOk);
            divConfirm.className = "RemoveBox";
            divSnap.appendChild(divConfirm);
            return;
        }
    }

    function cancelRemoveSnapshot(id) {
        var divSnap = document.getElementById("snap" + id);
        if (divSnap != null) {
            var divConfirm = document.getElementById("confirm" + id);
            if (divConfirm != null) divSnap.removeChild(divConfirm);
        }
    }

    function updateSnapshot(id) {
        saveCurrentPos();
        var bkg = chrome.extension.getBackgroundPage();
        bkg.updateTabs(id );
    }

    function removeSnapshot(id) {
        var req = new XMLHttpRequest();
        req.open("POST", host + "/snapshot/remove", true);
        var params = "id=" + id;
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    requestXml();
                    return true;
                }
            }
        };
        req.send(params);
    }
    function removeSelectedUrls(urls) {
        var req = new XMLHttpRequest();
        req.open("POST", host + "/snapshot/remove", true);
        var params = "id=" + id;
        req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        req.onreadystatechange = function () {
            if (req.readyState == 4) {
                if (req.status == 200) {
                    requestXml();
                    return true;
                }
            }
        };
        req.send(params);
    }

    function init() {
        initHintTextboxes();
        requestXml();
        requestNotification();
    }

    function removeInsideTag(parent) {
        if (parent) {
            if (parent.hasChildNodes()) {
                while (parent.childNodes.length >= 1) {
                    parent.removeChild(parent.firstChild);
                }
            }
        }
    }

    function requestXml() {
        var divParent = document.getElementById("frame");
        if (divParent) {
            var loading = document.createElement("span");
            loading.innerHTML = "<img src='upload.gif'/> Please wait...";
            loading.className = "loading";
            divParent.appendChild(loading);
        }
        var req = new XMLHttpRequest();
        req.open("GET", host + "/snapshot", true);
        req.onreadystatechange = function () {
            if (req.readyState > 3) {
                if (req.status == 200) {
                    showTabs(req);
                    return true;
                }
            }
        };
        req.send(null);
    }

    function keyPressed(e) {
        if (e.keyCode == 13) {
            iceTabs();
        } 
    }
    function closeNotify(id){
    	var e=document.getElementById("notify"+id);
    	if(e!=null)
    	{
	    	var req = new XMLHttpRequest();
	    	var params="id=" + id;
	    	req.open("POST", host + "/notify/viewed?id="+id, true);
	        req.onreadystatechange = function () {
	            if (req.readyState > 3) {
	                if (req.status == 200) {
	                	e.style.display="none";
	                    return true;
	                }
	            }
	        };
	            req.send(null);	        
	        
        }
    }
	document.addEventListener('DOMContentLoaded', function () {
  init();
   
});