<?php

  class DbFunctions {
    var $mysqli = null;
    
    function connect() {
      $mysqli = new mysqli('localhost', 'root', 'root', 'ncds');
      $err = $mysqli->connect_errno;
      if (!$err) {
        $this->mysqli = $mysqli;
        return true;
      } else {
        return false;
      }
    }
    
    function getRoute($sRouteID_Combo) {
      if ($this->mysqli == null) throw new Exception("Not connected");
      
      $sql = "SELECT d.sRouteID_Combo, d.iSortOrder, d.sDirection, d.iDirectionID, iLineInTheSand, sHseNum, sStreet, address_lat, address_lng, a.iGeocodeID, d.sSideofStreet
              FROM Direction AS d
              LEFT JOIN Address AS a ON d.iAddressID = a.iAddressID
              LEFT JOIN Geocodes AS g ON g.iGeocodeID = a.iGeocodeID
              WHERE d.sRouteID_Combo = ? AND d.iDeleted = 0
              ORDER BY iLineInTheSand DESC, iSortOrder";

      $stmt = $this->mysqli->prepare($sql);
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
      $stmt->close();

      return $arr;
    }

    function updateDirectionOrder($sRouteID_Combo, $row) {
      if ($this->mysqli == null) throw new Exception("Not connected");

      $iDirectionID = intval(isset($row['iDirectionID']) ? $row['iDirectionID'] : 0);
      $iSortOrder = intval(isset($row['iSortOrder']) ? $row['iSortOrder'] : 0);
      $iDeleted = intval(isset($row['iDeleted']) ? $row['iDeleted'] : 0);

      $sSideofStreet = isset($row['sSideofStreet']) ? $row['sSideofStreet'] : '';
      $sDirection = isset($row['sDirection']) ? $row['sDirection'] : '';

      if ($iDirectionID >= 0) {
        $this->updateDirection($iSortOrder, $iDeleted, $iDirectionID, $sSideofStreet);
      } else if (strlen($sDirection) > 0 && $iDeleted == 0) {
        $this->insertDirection($sRouteID_Combo, $iSortOrder, $sDirection, $sSideofStreet);
      }
    }

    private function updateDirection($iSortOrder, $iDeleted, $iDirectionID, $sSideofStreet) {
      $sql = "UPDATE direction SET iSortOrder = ?, sSideofStreet = ?, iDeleted = ? WHERE iDirectionID = ?";

      $stmt = $this->mysqli->prepare($sql);
      if (!$stmt->bind_param("isii", $iSortOrder, $sSideofStreet, $iDeleted, $iDirectionID)) {
        throw new Exception("Failed to bind parameters");
      }

      if (!$stmt->execute()) {
        throw new Exception("Error updating record: " . $conn->error);
      }

      $stmt->close();
    }

    private function insertDirection($sRouteID_Combo, $iSortOrder, $sDirection, $sSideofStreet) {
      $sql = "INSERT INTO direction (sRouteID_Combo, iSortOrder, sDirection, sSideofStreet, dUpdatedOn, sUserID) 
              VALUES (?, ?, ?, ?, NOW(), 'nspainhower')";

      $stmt = $this->mysqli->prepare($sql);
      if (!$stmt->bind_param("ssss", $sRouteID_Combo, $iSortOrder, $sDirection, $sSideofStreet)) {
        throw new Exception("Failed to bind parameters");
      }
      
      if (!$stmt->execute()) {
        throw new Exception("Faied to insert new direction");
      }

      $stmt->close();
    }
    
    function close() {
      if ($this->mysqli == null) return;
      
      $this->mysqli->close();
    }
  }

?>