const { hashUserId, getCentralTime } = require("./utils");
const assert = require("assert");

function testHashUserId() {
  process.env.TELEMETRY_SALT = "test_salt";
  const userId = "user123";
  const hash1 = hashUserId(userId);
  const hash2 = hashUserId(userId);

  assert.strictEqual(hash1, hash2, "Hashes should be consistent for the same input");
  assert.notStrictEqual(hash1, userId, "Hash should not be equal to raw ID");
  assert.strictEqual(hash1.length, 64, "SHA256 hash should be 64 characters long");

  const differentHash = hashUserId("user456");
  assert.notStrictEqual(hash1, differentHash, "Different users should have different hashes");

  console.log("testHashUserId passed");
}

function testGetCentralTime() {
  const date = new Date("2023-10-27T12:00:00Z"); // UTC
  const centralTime = getCentralTime(date);

  // America/Chicago is UTC-6 (Standard) or UTC-5 (Daylight)
  // 12:00 UTC should be 07:00 or 06:00 Central
  assert.ok(centralTime.includes("7:00") || centralTime.includes("6:00"), "Central time calculation seems incorrect: " + centralTime);

  console.log("testGetCentralTime passed");
}

try {
  testHashUserId();
  testGetCentralTime();
  console.log("All telemetry utils tests passed!");
} catch (error) {
  console.error("Tests failed:", error);
  process.exit(1);
}
