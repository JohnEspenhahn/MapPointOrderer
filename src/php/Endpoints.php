<?php
  require('DbFunctions.php');

  $request = explode('/', trim($_SERVER['PATH_INFO'],'/'));
  switch($_SERVER['REQUEST_METHOD'])
  {
  case 'GET': 
    // /route/<sRouteID_Combo>
    if (sizeof($request) == 2 and $request[0] == 'route') {
      $dbf = new DbFunctions();
      $ok = $dbf->connect();
      if (!$ok) {
        http_response_code(404);
        die("Failed to connect");
      }

      // Perform request and handle errors with request
      try {
        $res = $dbf->getRoute($request[1]);
      } catch (Exception $e) {
        http_response_code(404);
        $res = $e->getMessage();
      }

      // Output response
      echo json_encode($res);
      $dbf->close();
    }
    break;
  case 'PUT': 
    // /route/<sRouteID_Combo>
    if (sizeof($request) == 2 and $request[0] == 'route') {
      $dbf = new DbFunctions();
      $ok = $dbf->connect();
      if (!$ok) {
        http_response_code(404);
        die("Failed to connect");
      }

      // Perform request and handle errors with request
      try {
        $body = json_decode(file_get_contents('php://input'), true);
        foreach ($body as $row) {
          $dbf->updateDirectionOrder($request[1], $row['iDirectionID'], $row['iSortOrder'], $row['sDirection']);
        }
      } catch (Exception $e) {
        http_response_code(404);
        $res = $e->getMessage();
      }

      // Output response
      echo '{ "result": "ok" }';
      $dbf->close();
    }
    break;
    break;
  default:
  }

?>