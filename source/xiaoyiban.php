<?php
header("Content-Type: text/html; charset=utf8");//防止界面乱码
echo"<meta name='viewport' content='width=320px, user-scalable=yes'>";

mysql_connect("qdm723417486.my3w.com:3306", "qdm723417486", "Xiao1Ban");//连接MySQL
mysql_select_db("qdm723417486_db");//选择数据库
mysql_query("set names utf8"); //**设置字符集***

$sql = "select * from kindergarten order by ID asc";
echo "<h1>小一班的统计表</h1>";

echo "<table border='1'>
<tr>
<th>序号</th>
<th>姓名</th>
<th>统计要求</th>
<th>修改</th>
</tr>";

$result = mysql_query($sql);//借SQL语句插入数据
while ($row = mysql_fetch_array($result)) {
    echo "<form action='result.php' method='post'>";
    echo "<tr>";
    echo "<td><input style='width:20px;' name='ID' readonly='readonly' value='" . $row['ID']. "' ></input></td>";
    // echo "<td>" . $row['mname']. "</td>";
    echo "<td><input style='width:65px;' name='mname' readonly='readonly' value='" . $row['mname']. "' ></input></td>";

    echo "<td><textarea  name='things' style='width:300px;height:40px;'>" . $row['things'] . "</textarea></td>";
    echo "<td><input type='submit' name='act' value='提交修改' /></td>";
    echo "</tr>";
    echo "</form>";

}
mysql_close();

echo "</table>";
echo "<br>";
echo "<br>";
echo "<br>";
echo "<br>";
echo "<br>";
?>