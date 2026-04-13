import Common "../types/common";
import Types "../types/locations";
import List "mo:core/List";


module {
  public func createLocation(
    locations : List.List<Types.Location>,
    nextId : Nat,
    input : Types.CreateLocationInput,
  ) : (Types.Location, Nat) {
    let loc : Types.Location = {
      id = nextId;
      locationType = input.locationType;
      name = input.name;
      slug = input.slug;
      parentId = input.parentId;
      description = input.description;
      featuredImageUrl = input.featuredImageUrl;
      latitude = input.latitude;
      longitude = input.longitude;
    };
    locations.add(loc);
    (loc, nextId + 1);
  };

  public func updateLocation(
    locations : List.List<Types.Location>,
    locationId : Common.LocationId,
    input : Types.UpdateLocationInput,
  ) : ?Types.Location {
    var updated : ?Types.Location = null;
    locations.mapInPlace(func(l) {
      if (l.id == locationId) {
        let upd : Types.Location = {
          l with
          name = switch (input.name) { case (?v) v; case null l.name };
          slug = switch (input.slug) { case (?v) v; case null l.slug };
          description = switch (input.description) { case (?v) v; case null l.description };
          featuredImageUrl = switch (input.featuredImageUrl) { case (?v) v; case null l.featuredImageUrl };
          latitude = switch (input.latitude) { case (?v) v; case null l.latitude };
          longitude = switch (input.longitude) { case (?v) v; case null l.longitude };
        };
        updated := ?upd;
        upd;
      } else { l };
    });
    updated;
  };

  public func getLocation(
    locations : List.List<Types.Location>,
    locationId : Common.LocationId,
  ) : ?Types.Location {
    locations.find(func(l) { l.id == locationId });
  };

  public func getLocationBySlug(
    locations : List.List<Types.Location>,
    slug : Text,
  ) : ?Types.Location {
    locations.find(func(l) { l.slug == slug });
  };

  public func listLocations(
    locations : List.List<Types.Location>,
  ) : [Types.Location] {
    locations.toArray();
  };

  public func listNeighborhoodsByCity(
    locations : List.List<Types.Location>,
    cityId : Common.LocationId,
  ) : [Types.Location] {
    locations.filter(func(l) {
      l.locationType == #neighborhood and l.parentId == ?cityId
    }).toArray();
  };
};
