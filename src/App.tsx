import { useState } from "react";
import {
  Button,
  Card,
  Flex,
  ProgressBar,
  TextInput,
  Title,
} from "@tremor/react";

function App() {
  const [sourceDir, setSourceDir] = useState("");
  const [targetDir, setTargetDir] = useState("");
  const [fileList, setFileList] = useState([]);
  const [logText, setLogText] = useState("");
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  function addLog(line: string) {
    setLogText((text) => {
      return `${line}\n\n${text}`;
    });
  }

  return (
    <div className="w-96 flex flex-col space-y-4">
      <TextInput
        placeholder="请选择源文件夹..."
        value={sourceDir}
        onClick={async () => {
          const res = await window.ipcRenderer.invoke("openDirectory");
          setSourceDir(res);

          const files = await window.ipcRenderer.invoke("getLockFiles", res);
          setFileList(files);
        }}
      />
      <TextInput
        placeholder="请选择目标文件夹..."
        value={targetDir}
        onClick={() => {
          window.ipcRenderer.invoke("openDirectory").then((res) => {
            setTargetDir(res);
          });
        }}
      />

      <Button
        color="rose"
        variant="secondary"
        disabled={!sourceDir || !targetDir || processing}
        onClick={async () => {
          setProcessing(true);
          setLogText(() => {
            return "开始处理🚀";
          });

          let successCount = 0;
          for (const file of fileList) {
            addLog(`${file} -> ${targetDir} ⌛️`);
            await window.ipcRenderer.invoke("transfer", file, targetDir);
            successCount += 1;
            setProgress(Math.round((successCount + 1) / fileList.length * 100));
            addLog(`${file} -> ${targetDir} ✅`);
            await new Promise((resolve) => setTimeout(resolve, 300));
          }

          addLog("处理完成 🎉");
          setProcessing(false);
        }}
      >
        开始转移
      </Button>

      <Card>
        <Flex className="mb-4">
          <Title>执行日志</Title>
          <Button
            color="cyan"
            size="xs"
            onClick={() => {
              setLogText("");
              setProgress(0);
            }}
          >
            清空
          </Button>
        </Flex>
        <div className="text-left text-gray-500 dark:text-gray-400 break-all whitespace-pre-line text-sm h-64 overflow-y-auto">
          {logText}
        </div>
        <ProgressBar value={progress} className="mt-4" />
      </Card>
    </div>
  );
}

export default App;
