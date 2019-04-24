import * as playlistloader from "youtube-playlist";
import * as fs from "fs";
import {exec} from "child_process";
import config from "../config"

var names: String[] = [], urls: String[] = [], i:number;

if(config.playlist === "") throw new TypeError("Playlist URL Not Specified");

main(config.playlist);

async function main(url: String) {
    await playlistloader(url, "url").then((res: any) => {
        res.data.playlist.forEach((element: String) => {
            urls.push(element);
        });
    });

    await playlistloader(url, "name").then((res: any) => {
        res.data.playlist.forEach((element: any) => {
            names.push(element);
        });
    });

    await names.forEach(function (name: String) {
        name.replace("\"", "");
    });

    var file = fs.createWriteStream("dl.sh", { flags: "a" });
    for(i=0;i<urls.length;i++) {
        file.write(
            `ytdl ${urls[i]} | ffmpeg -i pipe:0 -b:a 192K -vn ./mp3/"${
                names[i]
            }.mp3"\n`
        );
    }
    await file.write("echo \"Done Downloading All Songs 🎉\"\necho \"Changing CHMOD\"\nchmod -R 777 ./mp3\necho \"Sucessfully Downloaded!\"")
    file.close();

    await exec("chmod +x ./dl.sh");
    console.log("[ PROCESS ] Finished Writing to dl.sh");
    if(config.autoDownload) {
        console.log("Starting to Download");
        exec("./dl.sh");
    }
}
