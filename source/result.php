<?php
header("Content-Type: text/html; charset=utf8");//防止界面乱码
echo"<meta name='viewport' content='width=320px, user-scalable=yes'>";

mysql_connect("qdm723417486.my3w.com:3306", "qdm723417486", "Xiao1Ban");//连接MySQL
mysql_select_db("qdm723417486_db");//选择数据库
mysql_query("set names utf8"); //**设置字符集***

$sql = "UPDATE kindergarten SET things='" . $_POST['things'] . "' WHERE mname='" . $_POST['mname'] . "' AND ID=" .$_POST['ID'];
$result = mysql_query($sql);//借SQL语句插入数据

echo "修改成功";
echo "<br>";
echo "<a href='xiaoyiban.php'>点击返回</a>";


$sql = "select * from kindergarten order by ID asc";

echo "<h1>小一班的统计表</h1>";
echo "<table border='1'>
<tr>
<th>序号</th>
<th>姓名</th>
<th>统计要求</th>
</tr>";

$result = mysql_query($sql);//借SQL语句插入数据
while ($row = mysql_fetch_array($result)) {
    echo "<tr>";
    echo "<td style='width:20px;'>" . $row['ID']. "</td>";
    echo "<td style='width:65px;'>" . $row['mname']. "</td>";
    echo "<td>" . $row['things'] . "</td>";
    echo "</tr>";
}

mysql_close();

echo "</table>";
?>