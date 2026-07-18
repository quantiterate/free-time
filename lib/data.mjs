
export const personas = {
  maria: {
    id: "maria",
    name: "Maria",
    summary: "Calm, accessible, predictable outings with pet access, reliable seating, and an easy exit.",
    hardConstraints: ["no_flashing_lights","low_crowd","pet_access","reliable_seating","quiet_environment"],
    maxWalkingMiles: 0.35,
    preferredDriveMinutes: 15,
    preferredIntensity: "low",
    requiresSeating: true,
    noiseTolerance: "low",
    crowdTolerance: "low",
    prefersPredictable: true,
    categories: ["cafe","gallery","bookstore"],
    dislikes: ["bar","high_intensity_sport"],
    noveltyPreference: "familiar",
    vector: [0.2,0.9,0.95,0.8,0.2,0.9]
  },
  james: {
    id: "james",
    name: "James",
    summary: "Highly active, social, and novelty-seeking with strong walking tolerance.",
    hardConstraints: [],
    maxWalkingMiles: 4,
    preferredDriveMinutes: 25,
    preferredIntensity: "high",
    requiresSeating: false,
    noiseTolerance: "high",
    crowdTolerance: "high",
    prefersPredictable: false,
    categories: ["sport","kayak","tour"],
    dislikes: ["coloring","passive"],
    noveltyPreference: "novel",
    vector: [0.95,0.2,0.2,0.8,0.9,0.1]
  },
  lee: {
    id: "lee",
    name: "Lee",
    summary: "Quiet, seated experiences with short walking distances, accessible restrooms, and dependable parking.",
    hardConstraints: ["reliable_seating","accessible_restroom","parking_near_entrance","quiet_environment"],
    maxWalkingMiles: 0.25,
    preferredDriveMinutes: 15,
    preferredIntensity: "low",
    requiresSeating: true,
    noiseTolerance: "low",
    crowdTolerance: "medium",
    prefersPredictable: true,
    categories: ["lecture","scenic_drive","library"],
    dislikes: ["standing_event","long_walk"],
    noveltyPreference: "familiar",
    vector: [0.3,0.8,0.85,0.65,0.25,0.8]
  }
};

export const candidates = [
  {
    id:"quiet-cafe", title:"Quiet Lakeside Café", category:"cafe",
    social:"Together", setting:"Inside", costClass:"Pay",
    outboundMinutes:12, activityMinutes:72, returnMinutes:12,
    walkingMiles:0.12, intensity:"low", noiseLevel:"low", crowdLevel:"low",
    flashingLights:false, petFriendly:true, reliableSeating:true,
    wheelchairAccessible:true, accessibleRestroom:true, parkingNearEntrance:true,
    alcoholCentered:false, predictable:true, cardAccepted:true,
    novelty:"familiar", confidence:"high",
    facts:["Quiet rear seating","Accessible entrance","Cards accepted","Pet access confirmed"]
  },
  {
    id:"gallery-tea", title:"Small Art Gallery + Tea", category:"gallery",
    social:"Together", setting:"Inside", costClass:"Pay",
    outboundMinutes:14, activityMinutes:70, returnMinutes:14,
    walkingMiles:0.28, intensity:"low", noiseLevel:"low", crowdLevel:"low",
    flashingLights:false, petFriendly:true, reliableSeating:true,
    wheelchairAccessible:true, accessibleRestroom:true, parkingNearEntrance:false,
    alcoholCentered:false, predictable:true, cardAccepted:true,
    novelty:"novel", confidence:"medium",
    facts:["Benches in each room","Low crowd forecast","No flashing exhibits"]
  },
  {
    id:"book-cafe", title:"Pet-Friendly Book Café", category:"bookstore",
    social:"Together", setting:"Inside", costClass:"Pay",
    outboundMinutes:9, activityMinutes:72, returnMinutes:9,
    walkingMiles:0.15, intensity:"low", noiseLevel:"low", crowdLevel:"medium",
    flashingLights:false, petFriendly:true, reliableSeating:true,
    wheelchairAccessible:true, accessibleRestroom:true, parkingNearEntrance:true,
    alcoholCentered:false, predictable:true, cardAccepted:true,
    novelty:"familiar", confidence:"medium",
    facts:["Short drive","Quiet tables","Accessible restroom","Easy early departure"]
  },
  {
    id:"pickleball", title:"Pickleball Round Robin", category:"sport",
    social:"Together", setting:"Outside", costClass:"Pay",
    outboundMinutes:10, activityMinutes:80, returnMinutes:10,
    walkingMiles:0.7, intensity:"high", noiseLevel:"medium", crowdLevel:"medium",
    flashingLights:false, petFriendly:false, reliableSeating:false,
    wheelchairAccessible:false, accessibleRestroom:true, parkingNearEntrance:true,
    alcoholCentered:false, predictable:true, cardAccepted:true,
    novelty:"novel", confidence:"high",
    facts:["Social competition","Equipment rental","Defined schedule"]
  },
  {
    id:"kayak", title:"Guided Kayak Sprint", category:"kayak",
    social:"Together", setting:"Outside", costClass:"Pay",
    outboundMinutes:13, activityMinutes:72, returnMinutes:13,
    walkingMiles:0.4, intensity:"high", noiseLevel:"low", crowdLevel:"low",
    flashingLights:false, petFriendly:false, reliableSeating:false,
    wheelchairAccessible:false, accessibleRestroom:false, parkingNearEntrance:true,
    alcoholCentered:false, predictable:false, cardAccepted:true,
    novelty:"novel", confidence:"medium",
    facts:["High novelty","Physical challenge","Defined rental window"]
  },
  {
    id:"matinee-talk", title:"Reserved Matinee Talk", category:"lecture",
    social:"Together", setting:"Inside", costClass:"Pay",
    outboundMinutes:11, activityMinutes:70, returnMinutes:11,
    walkingMiles:0.18, intensity:"low", noiseLevel:"low", crowdLevel:"medium",
    flashingLights:false, petFriendly:false, reliableSeating:true,
    wheelchairAccessible:true, accessibleRestroom:true, parkingNearEntrance:true,
    alcoholCentered:false, predictable:true, cardAccepted:true,
    novelty:"familiar", confidence:"high",
    facts:["Reserved aisle seating","Accessible parking","Short indoor route"]
  }
];

export const neighbors = [
  {id:"n1", vector:[0.25,0.88,0.9,0.7,0.2,0.85], ratings:{"quiet-cafe":5,"gallery-tea":4,"book-cafe":5,"pickleball":-5}},
  {id:"n2", vector:[0.9,0.25,0.2,0.85,0.95,0.2], ratings:{"pickleball":5,"kayak":5,"quiet-cafe":1}},
  {id:"n3", vector:[0.35,0.75,0.8,0.65,0.3,0.75], ratings:{"matinee-talk":5,"quiet-cafe":4,"gallery-tea":3}},
  {id:"n4", vector:[0.55,0.45,0.4,0.6,0.7,0.4], ratings:{"gallery-tea":4,"pickleball":3,"book-cafe":2}}
];
