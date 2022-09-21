import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';
import download from 'download';
import extract from 'extract-zip';

let target = `https://api.github.com/repos/starbrat/st_updater_script/releases/latest`;
let version = `v0.0.1`;
let downloadDirectory = "./test";
let installDirectory = "./test";
let updateFileName = 'update.zip';

const cleanUp = async () => {
	console.log("Cleaning up update sources...");

	fs.unlink(path.join(downloadDirectory, updateFileName), (err) => {
		if (err) throw err;

		console.log('Clean up complete.');
	});
};

const installUpdate = async () => {
	console.log("Installing update...");

	let source = path.join(downloadDirectory, updateFileName);

	try {
	    await extract(source, { dir: path.resolve(installDirectory) })
	    console.log('Installed update!');

	    cleanUp();
  	}
  	catch (err) {
	    // handle any errors
	    console.log("Error installing:", err);
  	}
};

const downloadUpdate = async (url) => {
   	console.log("Downloading update...", url);

    download(url, downloadDirectory).then(() => {
    	console.log("Downloaded!");

    	installUpdate();
    }, (err) => {
    	console.log("Error downloading:", err);
    });
};

const getData = async (callback) => {
	const response = await fetch(target);
	const data = await response.json();

	//callback with version comparison
	if (callback && typeof callback == "function") 
		callback(data.tag_name != version, data);
};

const updateChecker = async (timeout) => {
	const interval = setInterval(async () => {
		getData(async (update, data) => {
			if (update) {
				//update available
				console.log("Update available!");			
				let assets = data.assets;

				//get the update zip
				for (var i = 0; i < assets.length; i++) {
					console.log(assets[i].name);
					if (assets[i].name == updateFileName) {
						downloadUpdate(assets[i].browser_download_url);
						break;
					}
				}
			}
			else {
				//no update available
			}
		});
	}, timeout);
};

//start update service (every 15 seconds)
updateChecker(15000);