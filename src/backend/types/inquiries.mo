import Common "common";

module {
  public type InquiryType = {
    #contactAgent;
    #scheduleVisit;
    #requestCallback;
  };

  public type InquiryStatus = {
    #pending;
    #responded;
    #closed;
  };

  public type Inquiry = {
    id : Common.InquiryId;
    propertyId : Common.PropertyId;
    userId : Common.UserId;
    inquiryType : InquiryType;
    message : Text;
    contactDetails : Text;
    preferredTime : ?Text;
    status : InquiryStatus;
    createdAt : Common.Timestamp;
  };

  public type CreateInquiryInput = {
    propertyId : Common.PropertyId;
    inquiryType : InquiryType;
    message : Text;
    contactDetails : Text;
    preferredTime : ?Text;
  };
};
