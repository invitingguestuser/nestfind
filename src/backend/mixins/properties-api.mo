import Common "../types/common";
import PropTypes "../types/properties";
import PropLib "../lib/properties";
import List "mo:core/List";

mixin (
  properties : List.List<PropTypes.Property>,
  savedProperties : List.List<PropTypes.SavedProperty>,
  compareList : List.List<PropTypes.CompareEntry>,
) {
  var nextPropertyId : Nat = properties.size() + 1;

  public shared ({ caller }) func createProperty(input : PropTypes.CreatePropertyInput) : async PropTypes.Property {
    let (prop, newId) = PropLib.createProperty(properties, nextPropertyId, caller, input);
    nextPropertyId := newId;
    prop;
  };

  public shared ({ caller }) func updateProperty(propertyId : Common.PropertyId, input : PropTypes.UpdatePropertyInput) : async ?PropTypes.Property {
    PropLib.updateProperty(properties, caller, propertyId, input);
  };

  public shared ({ caller }) func deleteProperty(propertyId : Common.PropertyId) : async Bool {
    PropLib.deleteProperty(properties, caller, propertyId);
  };

  public query func getProperty(propertyId : Common.PropertyId) : async ?PropTypes.Property {
    PropLib.getProperty(properties, propertyId);
  };

  public query func listProperties(page : Nat, pageSize : Nat) : async Common.Page<PropTypes.Property> {
    PropLib.listProperties(properties, page, pageSize);
  };

  public query func searchProperties(filters : PropTypes.SearchFilters) : async Common.Page<PropTypes.Property> {
    PropLib.searchProperties(properties, filters);
  };

  public shared ({ caller }) func approveProperty(propertyId : Common.PropertyId, verificationSource : Text) : async ?PropTypes.Property {
    PropLib.approveProperty(properties, propertyId, verificationSource);
  };

  public shared ({ caller }) func rejectProperty(propertyId : Common.PropertyId, reason : Text) : async ?PropTypes.Property {
    PropLib.rejectProperty(properties, propertyId, reason);
  };

  public query func getAgentListings(agentId : Common.UserId) : async [PropTypes.Property] {
    PropLib.getAgentListings(properties, agentId);
  };

  public query func getFeaturedProperties() : async [PropTypes.Property] {
    PropLib.getFeaturedProperties(properties);
  };

  public query func getSimilarProperties(propertyId : Common.PropertyId) : async [PropTypes.Property] {
    PropLib.getSimilarProperties(properties, propertyId);
  };

  public shared ({ caller }) func saveProperty(propertyId : Common.PropertyId) : async () {
    PropLib.saveProperty(savedProperties, caller, propertyId);
  };

  public shared ({ caller }) func unsaveProperty(propertyId : Common.PropertyId) : async () {
    PropLib.unsaveProperty(savedProperties, caller, propertyId);
  };

  public query ({ caller }) func getSavedProperties() : async [PropTypes.Property] {
    PropLib.getSavedProperties(savedProperties, properties, caller);
  };

  public shared ({ caller }) func addToCompare(propertyId : Common.PropertyId) : async () {
    PropLib.addToCompare(compareList, caller, propertyId);
  };

  public shared ({ caller }) func removeFromCompare(propertyId : Common.PropertyId) : async () {
    PropLib.removeFromCompare(compareList, caller, propertyId);
  };

  public query ({ caller }) func getCompareList() : async [PropTypes.Property] {
    PropLib.getCompareList(compareList, properties, caller);
  };

  public query func getPropertiesByCity(city : Text) : async [PropTypes.Property] {
    PropLib.getPropertiesByCity(properties, city);
  };

  public query func getPropertiesByNeighborhood(neighborhood : Text) : async [PropTypes.Property] {
    PropLib.getPropertiesByNeighborhood(properties, neighborhood);
  };

  public query func getPropertiesByType(propertyType : PropTypes.PropertyType) : async [PropTypes.Property] {
    PropLib.getPropertiesByType(properties, propertyType);
  };
};
