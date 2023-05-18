import { useState } from "react";
import "./App.css";
import { message, open } from "@tauri-apps/api/dialog";
import { Command } from "@tauri-apps/api/shell";
import { copyFile } from "@tauri-apps/api/fs";
import { basename, join } from "@tauri-apps/api/path";

function App() {
  const [progressing, setProgressing] = useState(false);
  const [logText, setLogText] = useState("");
  const [sourceDir, setSourceDir] = useState("");
  const [targetDir, setTargetDir] = useState("");

  async function selectSourceDir() {
    const result = (await open({
      directory: true,
    })) as string;
    setSourceDir(result);
  }

  async function selectTargerDir() {
    const result = (await open({
      directory: true,
    })) as string;
    setTargetDir(result);
  }

  async function run() {
    setProgressing(true);
    try {
      if (!sourceDir) {
        await message("请选择来源文件夹", { title: "警告", type: "warning" });
        return;
      }

      if (!targetDir) {
        await message("请选择目标文件夹", { title: "警告", type: "warning" });
        return;
      }

      const { stdout } = await new Command("sh", [
        "-c",
        `find ${sourceDir} -type f -flags +uchg`,
      ]).execute();

      const files = stdout.split("\n");
      for (const file of files) {
        const targetFile = await join(targetDir, await basename(file));
        setLogText(`正在复制文件 ${file} 到 ${targetFile}....`);
        await copyFile(file, targetFile);
      }
      await message("执行完成", { title: "成功", type: "info" });
    } catch (error: any) {
      await message(error, { title: "错误", type: "error" });
    } finally {
      setLogText("");
      setProgressing(false);
    }
  }

  return (
    <div className="container">
      <h1>锁定文件拷贝工具</h1>
      <div className="row">
        <div>
          <input
            id="greet-input"
            value={sourceDir}
            placeholder="请选择来源文件夹"
          />
          <button onClick={selectSourceDir}>选择来源文件夹</button>
        </div>
      </div>
      <div className="row">
        <div>
          <input
            id="greet-input"
            value={targetDir}
            placeholder="请选择目标文件夹"
          />
          <button onClick={selectTargerDir}>选择目标文件夹</button>
        </div>
      </div>
      <div className="row" style={{ marginTop: 80 }}>
        <button onClick={run} disabled={progressing}>
          {progressing ? "运行中..." : "开始执行拷贝"}
        </button>
      </div>
      <div className="row" style={{ marginTop: 20 }}>
        {logText}
      </div>
    </div>
  );
}

export default App;
