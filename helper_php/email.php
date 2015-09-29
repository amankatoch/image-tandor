<?php
$data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $_REQUEST['imageData']));
file_put_contents('image.png', $data);
?>