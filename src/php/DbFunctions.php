<?php

  class DbFunctions {
    var $mysqli = null;
    
    function connect() {
      $mysqli = new mysqli('localhost', 'root', 'root', 'ncds');
      $err = ($this->mysqli->connect_errno);
      if (!$err) {
        $this->mysqli = $mysqli;
        return true;
      } else {
        return false;
      }
    }
    
    function getRoute($sRouteID_Combo) {
      if ($this->mysqli == null) throw new Exception("Not connected");
      
      $sql = "SELECT d.sRouteID_Combo, d.iSortOrder, d.sDirection, d.iDirectionID, iLineInTheSand, sHseNum, sStreet, address_lat, address_lng, a.iGeocodeID
              FROM Direction AS d
              LEFT JOIN Address AS a ON d.iAddressID = a.iAddressID
              LEFT JOIN Geocodes AS g ON g.iGeocodeID = a.iGeocodeID
              WHERE d.sRouteID_Combo = ?
              ORDER BY iLineInTheSand DESC, iSortOrder";

      if (!($stmt = $this->mysqli->prepare($sql))) {
        throw new Exception("Failed to prepare " . $mysqli->error);
      }

      if (!$stmt->bind_param("s", $sRouteID_Combo)) {
        throw new Exception("Failed to bind parameter " . $mysqli->error);
      }

      if (!$stmt->execute()) {
        throw new Exception("Execute failed: (" . $stmt->errno . ") " . $stmt->error);
      }

      $arr = array();
      $res = $stmt->get_result();
      while ($row = $res->fetch_assoc()) {
        $arr[] = $row;
      }
      $res->close();

      return $arr;
    }

    function updateDirectionOrder($iDirectionID, $iSortOrder) {
      if ($this->mysqli == null) throw new Exception("Not connected");

      $sql = "UPDATE direction SET iSortOrder = ? WHERE iDirectionID = ?";

      if (!($stmt = $this->mysqli->prepare($sql))) {
        throw new Exception("Failed to prepare " . $mysqli->error);
      }

      if (!$stmt->bind_param("ii", $iDirectionID, $iSortOrder)) {
        throw new Exception("Failed to bind parameter " . $mysqli->error);
      }

      if (!$stmt->execute()) {
        throw new Exception("Execute failed: (" . $stmt->errno . ") " . $stmt->error);
      }
    }
    
    function close() {
      if ($this->mysqli == null) return;
      
      $this->mysqli->close();
    }
  }

?>