import Common "common";

module {
  public type PropertyType = {
    #apartment;
    #house;
    #villa;
    #studio;
    #commercial;
  };

  public type PropertyStatus = {
    #pending;
    #approved;
    #rejected;
    #inactive;
  };

  public type Property = {
    id : Common.PropertyId;
    title : Text;
    price : Nat;
    propertyType : PropertyType;
    bedrooms : Nat;
    bathrooms : Nat;
    sqft : Nat;
    description : Text;
    address : Text;
    city : Text;
    neighborhood : Text;
    latitude : Float;
    longitude : Float;
    amenities : [Text];
    photos : [Text];
    agentId : Common.UserId;
    status : PropertyStatus;
    verifiedAt : ?Common.Timestamp;
    verificationSource : ?Text;
    isFeatured : Bool;
    createdAt : Common.Timestamp;
    updatedAt : Common.Timestamp;
  };

  public type CreatePropertyInput = {
    title : Text;
    price : Nat;
    propertyType : PropertyType;
    bedrooms : Nat;
    bathrooms : Nat;
    sqft : Nat;
    description : Text;
    address : Text;
    city : Text;
    neighborhood : Text;
    latitude : Float;
    longitude : Float;
    amenities : [Text];
    photos : [Text];
  };

  public type UpdatePropertyInput = {
    title : ?Text;
    price : ?Nat;
    propertyType : ?PropertyType;
    bedrooms : ?Nat;
    bathrooms : ?Nat;
    sqft : ?Nat;
    description : ?Text;
    address : ?Text;
    city : ?Text;
    neighborhood : ?Text;
    latitude : ?Float;
    longitude : ?Float;
    amenities : ?[Text];
    photos : ?[Text];
  };

  public type SearchFilters = {
    city : ?Text;
    neighborhood : ?Text;
    propertyType : ?PropertyType;
    minPrice : ?Nat;
    maxPrice : ?Nat;
    minBedrooms : ?Nat;
    maxBedrooms : ?Nat;
    minBathrooms : ?Nat;
    amenities : ?[Text];
    keyword : ?Text;
    page : Nat;
    pageSize : Nat;
  };

  public type SavedProperty = {
    userId : Common.UserId;
    propertyId : Common.PropertyId;
    savedAt : Common.Timestamp;
  };

  public type CompareEntry = {
    userId : Common.UserId;
    propertyId : Common.PropertyId;
    addedAt : Common.Timestamp;
  };
};
