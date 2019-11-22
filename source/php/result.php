<?php
header("Content-Type: text/html; charset=utf8");//防止界面乱码

mysql_connect("qdm723417486.my3w.com:3306", "qdm723417486", "Xiao1Ban");//连接MySQL
mysql_select_db("qdm723417486_db");//选择数据库
mysql_query("set names utf8"); //**设置字符集***

$sql = "UPDATE kindergarten SET things='" . $_POST['things'] . "' WHERE mname='" . $_POST['mname'] . "' AND ID=" .$_POST['ID'];
$result = mysql_query($sql);//借SQL语句插入数据
mysql_close();

echo "修改成功";
echo "<br>";
echo "<a href='xiaoyiban.php'>点击返回</a>";
?>