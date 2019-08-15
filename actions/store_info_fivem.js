	//---------------------------------------------------------------------
	// Created by General Wrex
	// My Patreons have made creating this script possible @ https://www.patreon.com/generalwrex
	// At the time of editing this script, they are:
	// - MitchDaGamer
	//
	// Thanks so much guys, you allow me to continue to do what i love!
	// Add URL to json object,
	// add path to the object you want from the json
	// set your variable type and name
	// example URL: https://api.github.com/repos/HellionCommunity/HellionExtendedServer/releases/latest
	// example Path: name
	// will return object.name
	// in this example the variable would contain "[DEV] Version 1.2.2.3"
	//---------------------------------------------------------------------

    module.exports = {

        //---------------------------------------------------------------------
        // DBM Mods Manager Variables (Optional but nice to have!)
        //
        // These are variables that DBM Mods Manager uses to show information
        // about the mods for people to see in the list.
        //---------------------------------------------------------------------
    
        // Who made the mod (If not set, defaults to "DBM Mods")
        author: "Kryste3Q",
    
        // The version of the mod (Defaults to 1.0.0)
        version: "1.0.0",
    
        // A short description to show on the mod line for this mod (Must be on a single line)
        short_description: "Stores info from fivem server.",
    
        // If it depends on any other mods by name, ex: KMODS if the mod uses something from KMods
        depends_on_mods: ["KMods"],
    
        //---------------------------------------------------------------------
    
        //---------------------------------------------------------------------
        // Action Name
        //
        // This is the name of the action displayed in the editor.
        //---------------------------------------------------------------------
    
        name: "Store Json From WebAPI",
    
    
        //---------------------------------------------------------------------
        // Action Section
        //
        // This is the section the action will fall into.
        //---------------------------------------------------------------------
    
        section: "JSON Things",
    
        //---------------------------------------------------------------------
        // Action Subtitle
        //
        // This function generates the subtitle displayed next to the name.
        //---------------------------------------------------------------------
    
        subtitle: function(data) {
            return `${data.varName}`;
        },
    
        //---------------------------------------------------------------------
        // Action Storage Function
        //
        // Stores the relevant variable info for the editor.
        //---------------------------------------------------------------------
    
        variableStorage: function(data, varType) {
            const type = parseInt(data.storage);
            if(type !== varType) return;
            return ([data.varName, 'JSON Object']);
        },
    
        //---------------------------------------------------------------------
        // Action Fields
        //
        // These are the fields for the action. These fields are customized
        // by creating elements with corresponding IDs in the HTML. These
        // are also the names of the fields stored in the action's JSON data.
        //---------------------------------------------------------------------
    
        fields: ["token", "user", "pass" ,"url", "path", "storage", "varName", "debugMode", "headers"],
    
        //---------------------------------------------------------------------
        // Command HTML
        //
        // This function returns a string containing the HTML used for
        // editing actions.
        //
        // The "isEvent" parameter will be true if this action is being used
        // for an event. Due to their nature, events lack certain information,
        // so edit the HTML to reflect this.
        //
        // The "data" parameter stores constants for select elements to use.
        // Each is an array: index 0 for commands, index 1 for events.
        // The names are: sendTargets, members, roles, channels,
        //                messages, servers, variables
        //---------------------------------------------------------------------
    
        html: function(isEvent, data) {
            return `
            <div id ="wrexdiv" style="width: 550px; height: 350px; overflow-y: scroll;">
            <div>
               <p>
                  <u>Mod Info:</u><br>
                  Created by Kryst3Q!<br> 		 
               </p>
            </div>
            <div style="float: left; width: 95%;">
               Server IP: <br>
               <textarea id="url" class="round" style="width: 99%; resize: none;" type="textarea" rows="4" cols="20"></textarea> 
            </div>
         
         <br><br>
         Options: (This mod have only 2 options) <br> 
         players or server ip <br> 
         <input id="path" class="round"; style="width: 75%;" type="text">
         <div>
            <br><br>
            <div style="float: left; width: 35%;">
               Store In:<br>
               <select id="storage" class="round" onchange="glob.variableChange(this, 'varNameContainer')">
               ${data.variables[0]}
               </select><br>
            </div>
            <div id="varNameContainer" style="display: ; float: right; width: 60%;">
               JSON Storage Variable Name:<br>
               <input id="varName" class="round" type="text"><br>
            </div>
         </div>
         `
        },
    
        //---------------------------------------------------------------------
        // Action Bot Function
        //
        // This is the function for the action within the Bot's Action class.
        // Keep in mind event calls won't have access to the "msg" parameter,
        // so be sure to provide checks for variable existance.
        //---------------------------------------------------------------------
    
        action: function(cache) {
    
            var _this = this;
    
            const data = cache.actions[cache.index];
    
            var KMods = this.getKMods();
            var request = KMods.require("request");
    
            const storage = parseInt(data.storage);
            const varName = this.evalMessage(data.varName, cache);
    
            var url = this.evalMessage(data.url, cache);
            var path = this.evalMessage(data.path, cache);
    
                    
            // if it fails the check, try to re-encode the url
            if(!KMods.checkURL(url)){
                url = encodeURI(url);
            }
    
            if(KMods.checkURL(url)){
    
                try {
                   
                    function storeData(error, res, jsonData) {    
                
                        var statusCode = res ? res.statusCode : 200;
                                
                        if(error){
                            var errorJson = JSON.stringify({error, statusCode})
                            _this.storeValue(errorJson, storage, varName, cache);
    
                            console.error("WebAPI: Error: " + errorJson + " stored to: ["+ varName+"]");
                        }else{
    
                            if(path){
                                var outData = KMods.jsonPath(jsonData, path);
    
                                if(_DEBUG) console.dir(outData);
    
                                try {
                                    var test = JSON.parse(JSON.stringify(outData));
                                } catch (error) {
                                    var errorJson = JSON.stringify({error: error, statusCode: statusCode, success: false})
                                    _this.storeValue(errorJson, storage, varName, cache);
                                    console.error(error.stack ? error.stack : error);
                                }
    
                                var outValue = eval(JSON.stringify(outData), cache);
    
                                if(outData.success != null){
                                    var errorJson = JSON.stringify({error: error, statusCode: statusCode, success: false})
                                    _this.storeValue(errorJson, storage, varName, cache);
                                    console.log("WebAPI: Error Invalid JSON, is the Path set correctly? [" + path + "]");
                                }else{
                                    if(outValue.success != null || !outValue){
                                        var errorJson = JSON.stringify({error: error, statusCode: statusCode, success: false})
                                        _this.storeValue(errorJson, storage, varName, cache);
                                        console.log("WebAPI: Error Invalid JSON, is the Path set correctly? [" + path + "]");
                                    }else{
                                        _this.storeValue(outValue, storage, varName, cache);
                                        _this.storeValue(jsonData, 1, url, cache);
                                        _this.storeValue(url, 1, url + "_URL", cache);
                                        if(_DEBUG) console.log("WebAPI: JSON Data values starting from ["+ path +"] stored to: ["+ varName+"]");
                                    }
                                }
    
                            }else{
                                if(_DEBUG) console.dir(jsonData);
                                _this.storeValue(jsonData, storage, varName, cache);
                                _this.storeValue(jsonData, 1, url, cache);
                                _this.storeValue(url, 1, url + "_URL", cache);
                                if(_DEBUG) console.log("WebAPI: JSON Data Object stored to: ["+ varName+"]");
                            }
                        }
                        _this.callNextAction(cache);
                    }
    
                    var oldUrl = this.getVariable(1, url + "_URL", cache);
    
                    if(url === oldUrl){
    
                        let jsonData;
                        let error;
                        let res = { statusCode:200 }
    
                        try {
                            jsonData = this.getVariable(1, url, cache);
                        } catch (err) {
                            error = err;
                        }
    
                        if(_DEBUG) console.log("WebAPI: Using previously stored json data from the initial store json action within this command.")
    
                        storeData(error, res, jsonData);
                        
    
                    }else{
    
                        let setHeaders = {};
    
                        // set default required header
                        setHeaders["User-Agent"] = "Other";
    
    
                        // Because headers are a dictionary ;)
                        if(headers){
                            var lines = String(headers).split('\n');
                            for(var i = 0;i < lines.length;i++){
                                var header = lines[i].split(':');
    
                                if(lines[i].includes(':') && header.length > 0){
                                    var key = header[0] || "Unknown";
                                    var value = header[1] || "Unknown";
                                    setHeaders[key] = value;
    
                                    if(_DEBUG) console.log("Applied Header: " + lines[i])
                                }else{
                                    console.error(`WebAPI: Error: Custom Header line ${lines[i]} is wrongly formatted. You must split the key from the value with a colon (:)`);
                                }				
                            }
                        }
    
    
                        request.get({
                            url: url,
                            json: true,
                            headers: setHeaders,
                            auth: {
                                bearer: token,
                                user: user,
                                pass: pass,
                                sendImmediately: false
                            },
                        }, (error, res, jsonData) => storeData(error, res, jsonData));	
                    }
    
                
                    
                } catch (err) {
                    console.error(err.stack ? err.stack : err);
                }
            }
            else{
                console.error('URL ['+url+'] Is Not Valid');
            }
        },
    
        //---------------------------------------------------------------------
        // Action Bot Mod
        //
        // Upon initialization of the bot, this code is run. Using the bot's
        // DBM namespace, one can add/modify existing functions if necessary.
        // In order to reduce conflictions between mods, be sure to alias
        // functions you wish to overwrite.
        //---------------------------------------------------------------------
    
        mod: function(DBM) {
                 // aliases for backwards compatibility, in the bot only, DBM will still say the action is missing.
                 DBM.Actions["Store variable fivem"] = DBM.Actions["Store info fivem"];
         }
    
        }; // End of module