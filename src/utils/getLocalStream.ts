// 获取本地屏幕流
export const getLocalScreenStream = async (sourceId: string) => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: <any>{
      mandatory: {
        chromeMediaSource: "desktop",
        chromeMediaSourceId: sourceId,
        maxFrameRate: 120, // 帧率
        minWidth: 1280,
        maxWidth: 1280,
        minHeight: 720,
        maxHeight: 720,
      },
    },
  });
  return stream;
};

type ConstraintsType = {
  audio: boolean;
  video: boolean;
};
// 获取本地音视频流
export const getLocalStream = async (constraints: ConstraintsType) => {
  const stream = await navigator.mediaDevices.getUserMedia(constraints);
  return stream;
};
