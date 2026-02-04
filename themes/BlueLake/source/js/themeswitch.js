  const today = new Date();
  const month = today.getMonth() + 1; // 月份从0开始，所以+1
  const day = today.getDate();

  // 获取body元素
  const body = document.querySelector('body');

  // 判断是否是12月13日
  if (month === 12 && day === 13) {
    body.classList.add('gray-theme'); // 添加灰色主题类
  } else {
    body.classList.add('default-theme'); // 添加默认主题类
  }
