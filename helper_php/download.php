<?php
header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="image.png"');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
$data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $_REQUEST['imageData']));

file_put_contents("php://output", $data);
?>