import Common "../types/common";
import LocTypes "../types/locations";
import LocLib "../lib/locations";
import UserLib "../lib/users";
import UserTypes "../types/users";
import List "mo:core/List";
import Runtime "mo:core/Runtime";

mixin (
  locations : List.List<LocTypes.Location>,
  users : List.List<UserTypes.User>,
) {
  var nextLocationId : Nat = locations.size() + 1;

  public shared ({ caller }) func createLocation(input : LocTypes.CreateLocationInput) : async LocTypes.Location {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    let (loc, newId) = LocLib.createLocation(locations, nextLocationId, input);
    nextLocationId := newId;
    loc;
  };

  public shared ({ caller }) func updateLocation(locationId : Common.LocationId, input : LocTypes.UpdateLocationInput) : async ?LocTypes.Location {
    if (not UserLib.isAdmin(users, caller)) {
      Runtime.trap("Unauthorized: admin only");
    };
    LocLib.updateLocation(locations, locationId, input);
  };

  public query func getLocation(locationId : Common.LocationId) : async ?LocTypes.Location {
    LocLib.getLocation(locations, locationId);
  };

  public query func getLocationBySlug(slug : Text) : async ?LocTypes.Location {
    LocLib.getLocationBySlug(locations, slug);
  };

  public query func listLocations() : async [LocTypes.Location] {
    LocLib.listLocations(locations);
  };

  public query func listNeighborhoodsByCity(cityId : Common.LocationId) : async [LocTypes.Location] {
    LocLib.listNeighborhoodsByCity(locations, cityId);
  };
};
