export const generateUsername = () => {
    const adjectives = ["Quick", "Lazy", "Happy", "Sad", "Brave", "Clever", "Silly", "Wise", "Bold", "Gentle", "Curious", "Friendly", "Mysterious", "Adventurous", "Playful", "Charming"];
    const nouns = ["Fox", "Dog", "Cat", "Mouse", "Bird", "Fish", "Lion", "Tiger", "Bear", "Wolf", "Traveler", "Explorer", "Adventurer", "Dreamer", "Thinker", "Creator", "Innovator", "Leader", "Follower", "Seeker", "Finder"];
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    
    return `${randomAdjective}${randomNoun}${Math.floor(Math.random() * 1000)}`;
}

export const prettifyTimestamp = (timestamp: string): string => {
    const date = timestamp.split("T")[0].split("-");

    return `${date[2]}/${date[1]}/${date[0]}`;
}