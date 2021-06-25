---
title: armbian上测试脸识别
tags:
  - 树莓派
  - Linux
  - armbian
comments: true
category: 树莓派
---

还是继续用orangepi pc plus下armbian做的测试，主要是用opencv+Face Recognition的方式进行实现。opencv大名鼎鼎没什么好介绍的，<a href="https://github.com/ageitgey/face_recognition" target="_blank">Face Recognition</a>则是由Adam Geitgey在GitHub上创建的一个强大、简单、易上手的人脸识别开源项目，并且配备了完整的开发文档和应用案例，兼容mac和Linux，特别是兼容树莓派系统，经个人测试发现也兼容armbian。

## 1. 软件安装

首先是安装必要的软件包，顺便把`python3-opencv`也装上，大致如下，其它的应该提前预装了：

```bash
sudo apt install build-essential cmake gfortran wget curl graphicsmagick libgraphicsmagick1-dev libatlas-base-dev libavcodec-dev libavformat-dev libboost-all-dev libgtk2.0-dev libjpeg-dev liblapack-dev libswscale-dev pkg-config python3-dev python3-numpy python3-pip python3-opencv python3-setuptools python3-wheel python-opencv zip 
```

剩下的就是安装Face Recognition库。由于armbian不像树莓派有提前编译好的依赖包，使用 pip3安装需要本机编译且armbian的tmpfs比较小，所以我把Face Recognition的依赖库提出来专门安装以减少编译时对tmpfs的压力，在树莓派上(mac个人测试也一样)其实只要`pip3 install face_recognition`即可：

```bash
pip3 config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
pip3 install numpy
pip3 install dlib
pip3 install face_recognition
```

## 2. 代码实现

算法其实Face Recognition已经封装好了，可直接调用。项目也提供了详细的示例代码，直接修改将opencv的输入从摄像头变为motion录制的视频，人脸毕竟涉及隐私，直接还是用原项目提供的奥巴马和拜登的照片，录了小段视频作为测试，给出代码：

```python
import face_recognition
import cv2
import numpy as np
import sys

# Load the video for face recognition
video_path = str(sys.argv[1])
video_capture = cv2.VideoCapture(video_path)

# Load a sample picture and learn how to recognize it.
obama_image = face_recognition.load_image_file("obama.jpg")
obama_face_encoding = face_recognition.face_encodings(obama_image)[0]

# Load a second sample picture and learn how to recognize it.
biden_image = face_recognition.load_image_file("biden.jpg")
biden_face_encoding = face_recognition.face_encodings(biden_image)[0]

# Create arrays of known face encodings and their names
known_face_encodings = [
    obama_face_encoding,
    biden_face_encoding
]
known_face_names = [
    "Barack Obama",
    "Joe Biden"
]

# Initialize some variables
face_locations = []
face_encodings = []
face_names = []
process_this_frame = True

while True:
    # Grab a single frame of video
    ret, frame = video_capture.read()

    # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
    rgb_frame = frame[:, :, ::-1]

    # Only process every other frame of video to save time
    if process_this_frame:
        # Find all the faces and face encodings in the current frame of video
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        face_names = []
        for face_encoding in face_encodings:
            # See if the face is a match for the known face(s)
            matches = face_recognition.compare_faces(known_face_encodings, face_encoding)
            name = "Unknown"
            # use the known face with the smallest distance to the new face
            face_distances = face_recognition.face_distance(known_face_encodings, face_encoding)
            best_match_index = np.argmin(face_distances)
            if matches[best_match_index]:
                name = known_face_names[best_match_index]
            face_names.append(name)

    process_this_frame = not process_this_frame
    print(face_names)

# Release handle to the webcam
video_capture.release()
cv2.destroyAllWindows()
```

经测试orangepi pc plus的算力还是有限，一小段视频都需要好几分钟才能跑完，为减少时间开销去掉了显示图片的过程，全部使用命令行的方式输出结果，效果如下所示：

<div align="center">
    <img src="/img/raspberrypi/facerec.jpg" style="width:75%" align="center"/>
    <p>图 对视频进行人脸识别</p>
</div>


项目源码可在<a href="https://github.com/slacker-HD/facerec_armbiantest" target="_blank">Github.com</a>下载（mac下测试程序也可以运行）。
