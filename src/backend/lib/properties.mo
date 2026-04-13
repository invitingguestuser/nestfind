import Common "../types/common";
import Types "../types/properties";
import List "mo:core/List";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  public func createProperty(
    properties : List.List<Types.Property>,
    nextId : Nat,
    caller : Common.UserId,
    input : Types.CreatePropertyInput,
  ) : (Types.Property, Nat) {
    let now = Time.now();
    let prop : Types.Property = {
      id = nextId;
      title = input.title;
      price = input.price;
      propertyType = input.propertyType;
      bedrooms = input.bedrooms;
      bathrooms = input.bathrooms;
      sqft = input.sqft;
      description = input.description;
      address = input.address;
      city = input.city;
      neighborhood = input.neighborhood;
      latitude = input.latitude;
      longitude = input.longitude;
      amenities = input.amenities;
      photos = input.photos;
      agentId = caller;
      status = #pending;
      verifiedAt = null;
      verificationSource = null;
      isFeatured = false;
      createdAt = now;
      updatedAt = now;
    };
    properties.add(prop);
    (prop, nextId + 1);
  };

  public func updateProperty(
    properties : List.List<Types.Property>,
    caller : Common.UserId,
    propertyId : Common.PropertyId,
    input : Types.UpdatePropertyInput,
  ) : ?Types.Property {
    let now = Time.now();
    var updated : ?Types.Property = null;
    properties.mapInPlace(func(p) {
      if (p.id == propertyId and Principal.equal(p.agentId, caller)) {
        let u : Types.Property = {
          p with
          title = switch (input.title) { case (?v) v; case null p.title };
          price = switch (input.price) { case (?v) v; case null p.price };
          propertyType = switch (input.propertyType) { case (?v) v; case null p.propertyType };
          bedrooms = switch (input.bedrooms) { case (?v) v; case null p.bedrooms };
          bathrooms = switch (input.bathrooms) { case (?v) v; case null p.bathrooms };
          sqft = switch (input.sqft) { case (?v) v; case null p.sqft };
          description = switch (input.description) { case (?v) v; case null p.description };
          address = switch (input.address) { case (?v) v; case null p.address };
          city = switch (input.city) { case (?v) v; case null p.city };
          neighborhood = switch (input.neighborhood) { case (?v) v; case null p.neighborhood };
          latitude = switch (input.latitude) { case (?v) v; case null p.latitude };
          longitude = switch (input.longitude) { case (?v) v; case null p.longitude };
          amenities = switch (input.amenities) { case (?v) v; case null p.amenities };
          photos = switch (input.photos) { case (?v) v; case null p.photos };
          updatedAt = now;
        };
        updated := ?u;
        u;
      } else { p };
    });
    updated;
  };

  public func deleteProperty(
    properties : List.List<Types.Property>,
    caller : Common.UserId,
    propertyId : Common.PropertyId,
  ) : Bool {
    let before = properties.size();
    properties.mapInPlace(func(p) {
      if (p.id == propertyId and Principal.equal(p.agentId, caller)) {
        { p with status = #inactive };
      } else { p };
    });
    // check if status changed
    switch (properties.find(func(p) { p.id == propertyId })) {
      case (?p) { p.status == #inactive };
      case null { before > properties.size() };
    };
  };

  public func getProperty(
    properties : List.List<Types.Property>,
    propertyId : Common.PropertyId,
  ) : ?Types.Property {
    properties.find(func(p) { p.id == propertyId });
  };

  public func listProperties(
    properties : List.List<Types.Property>,
    page : Nat,
    pageSize : Nat,
  ) : Common.Page<Types.Property> {
    let approved = properties.filter(func(p) { p.status == #approved });
    let total = approved.size();
    let start = page * pageSize;
    let items = approved.sliceToArray(start, start + pageSize);
    { items; total; page; pageSize };
  };

  func matchesFilters(p : Types.Property, filters : Types.SearchFilters) : Bool {
    if (p.status != #approved) return false;
    switch (filters.city) {
      case (?c) { if (p.city.toLower() != c.toLower()) return false };
      case null {};
    };
    switch (filters.neighborhood) {
      case (?n) { if (p.neighborhood.toLower() != n.toLower()) return false };
      case null {};
    };
    switch (filters.propertyType) {
      case (?pt) { if (p.propertyType != pt) return false };
      case null {};
    };
    switch (filters.minPrice) {
      case (?mp) { if (p.price < mp) return false };
      case null {};
    };
    switch (filters.maxPrice) {
      case (?mp) { if (p.price > mp) return false };
      case null {};
    };
    switch (filters.minBedrooms) {
      case (?mb) { if (p.bedrooms < mb) return false };
      case null {};
    };
    switch (filters.maxBedrooms) {
      case (?mb) { if (p.bedrooms > mb) return false };
      case null {};
    };
    switch (filters.minBathrooms) {
      case (?mb) { if (p.bathrooms < mb) return false };
      case null {};
    };
    switch (filters.amenities) {
      case (?reqAmenities) {
        for (a in reqAmenities.values()) {
          let found = p.amenities.any(func(pa) { pa.toLower() == a.toLower() });
          if (not found) return false;
        };
      };
      case null {};
    };
    switch (filters.keyword) {
      case (?kw) {
        let kwl = kw.toLower();
        let inTitle = p.title.toLower().contains(#text kwl);
        let inDesc = p.description.toLower().contains(#text kwl);
        let inCity = p.city.toLower().contains(#text kwl);
        let inNeighborhood = p.neighborhood.toLower().contains(#text kwl);
        if (not (inTitle or inDesc or inCity or inNeighborhood)) return false;
      };
      case null {};
    };
    true;
  };

  public func searchProperties(
    properties : List.List<Types.Property>,
    filters : Types.SearchFilters,
  ) : Common.Page<Types.Property> {
    let filtered = properties.filter(func(p) { matchesFilters(p, filters) });
    let total = filtered.size();
    let start = filters.page * filters.pageSize;
    let items = filtered.sliceToArray(start, start + filters.pageSize);
    { items; total; page = filters.page; pageSize = filters.pageSize };
  };

  public func approveProperty(
    properties : List.List<Types.Property>,
    propertyId : Common.PropertyId,
    verificationSource : Text,
  ) : ?Types.Property {
    let now = Time.now();
    var updated : ?Types.Property = null;
    properties.mapInPlace(func(p) {
      if (p.id == propertyId) {
        let u : Types.Property = {
          p with
          status = #approved;
          verifiedAt = ?now;
          verificationSource = ?verificationSource;
          updatedAt = now;
        };
        updated := ?u;
        u;
      } else { p };
    });
    updated;
  };

  public func rejectProperty(
    properties : List.List<Types.Property>,
    propertyId : Common.PropertyId,
    reason : Text,
  ) : ?Types.Property {
    let now = Time.now();
    var updated : ?Types.Property = null;
    properties.mapInPlace(func(p) {
      if (p.id == propertyId) {
        let u : Types.Property = { p with status = #rejected; updatedAt = now };
        updated := ?u;
        u;
      } else { p };
    });
    updated;
  };

  public func getAgentListings(
    properties : List.List<Types.Property>,
    agentId : Common.UserId,
  ) : [Types.Property] {
    properties.filter(func(p) {
      Principal.equal(p.agentId, agentId) and p.status != #inactive
    }).toArray();
  };

  public func getFeaturedProperties(
    properties : List.List<Types.Property>,
  ) : [Types.Property] {
    let featured = properties.filter(func(p) {
      p.status == #approved and p.isFeatured
    });
    featured.sliceToArray(0, 8);
  };

  public func getSimilarProperties(
    properties : List.List<Types.Property>,
    propertyId : Common.PropertyId,
  ) : [Types.Property] {
    let target = properties.find(func(p) { p.id == propertyId });
    switch (target) {
      case null { [] };
      case (?t) {
        let similar = properties.filter(func(p) {
          p.id != propertyId and p.status == #approved and
          p.city == t.city and p.propertyType == t.propertyType
        });
        similar.sliceToArray(0, 6);
      };
    };
  };

  public func saveProperty(
    saved : List.List<Types.SavedProperty>,
    userId : Common.UserId,
    propertyId : Common.PropertyId,
  ) : () {
    let exists = saved.any(func(s) {
      Principal.equal(s.userId, userId) and s.propertyId == propertyId
    });
    if (not exists) {
      saved.add({ userId; propertyId; savedAt = Time.now() });
    };
  };

  public func unsaveProperty(
    saved : List.List<Types.SavedProperty>,
    userId : Common.UserId,
    propertyId : Common.PropertyId,
  ) : () {
    let kept = saved.filter(func(s) {
      not (Principal.equal(s.userId, userId) and s.propertyId == propertyId)
    });
    saved.clear();
    saved.append(kept);
  };

  public func getSavedProperties(
    saved : List.List<Types.SavedProperty>,
    properties : List.List<Types.Property>,
    userId : Common.UserId,
  ) : [Types.Property] {
    let userSaved = saved.filter(func(s) { Principal.equal(s.userId, userId) });
    let result = List.empty<Types.Property>();
    userSaved.forEach(func(s) {
      switch (properties.find(func(p) { p.id == s.propertyId })) {
        case (?p) { result.add(p) };
        case null {};
      };
    });
    result.toArray();
  };

  public func addToCompare(
    compare : List.List<Types.CompareEntry>,
    userId : Common.UserId,
    propertyId : Common.PropertyId,
  ) : () {
    let userCompare = compare.filter(func(e) { Principal.equal(e.userId, userId) });
    if (userCompare.size() >= 4) {
      Runtime.trap("Compare list is limited to 4 properties");
    };
    let exists = userCompare.any(func(e) { e.propertyId == propertyId });
    if (not exists) {
      compare.add({ userId; propertyId; addedAt = Time.now() });
    };
  };

  public func removeFromCompare(
    compare : List.List<Types.CompareEntry>,
    userId : Common.UserId,
    propertyId : Common.PropertyId,
  ) : () {
    let kept = compare.filter(func(e) {
      not (Principal.equal(e.userId, userId) and e.propertyId == propertyId)
    });
    compare.clear();
    compare.append(kept);
  };

  public func getCompareList(
    compare : List.List<Types.CompareEntry>,
    properties : List.List<Types.Property>,
    userId : Common.UserId,
  ) : [Types.Property] {
    let userCompare = compare.filter(func(e) { Principal.equal(e.userId, userId) });
    let result = List.empty<Types.Property>();
    userCompare.forEach(func(e) {
      switch (properties.find(func(p) { p.id == e.propertyId })) {
        case (?p) { result.add(p) };
        case null {};
      };
    });
    result.toArray();
  };

  public func getPropertiesByCity(
    properties : List.List<Types.Property>,
    city : Text,
  ) : [Types.Property] {
    properties.filter(func(p) {
      p.status == #approved and p.city.toLower() == city.toLower()
    }).toArray();
  };

  public func getPropertiesByNeighborhood(
    properties : List.List<Types.Property>,
    neighborhood : Text,
  ) : [Types.Property] {
    properties.filter(func(p) {
      p.status == #approved and p.neighborhood.toLower() == neighborhood.toLower()
    }).toArray();
  };

  public func getPropertiesByType(
    properties : List.List<Types.Property>,
    propertyType : Types.PropertyType,
  ) : [Types.Property] {
    properties.filter(func(p) {
      p.status == #approved and p.propertyType == propertyType
    }).toArray();
  };
};
