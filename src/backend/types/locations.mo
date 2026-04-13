import Common "common";

module {
  public type LocationType = {
    #city;
    #neighborhood;
  };

  public type Location = {
    id : Common.LocationId;
    locationType : LocationType;
    name : Text;
    slug : Text;
    parentId : ?Common.LocationId;
    description : Text;
    featuredImageUrl : Text;
    latitude : Float;
    longitude : Float;
  };

  public type CreateLocationInput = {
    locationType : LocationType;
    name : Text;
    slug : Text;
    parentId : ?Common.LocationId;
    description : Text;
    featuredImageUrl : Text;
    latitude : Float;
    longitude : Float;
  };

  public type UpdateLocationInput = {
    name : ?Text;
    slug : ?Text;
    description : ?Text;
    featuredImageUrl : ?Text;
    latitude : ?Float;
    longitude : ?Float;
  };
};
