import mongoose from "mongoose";

// WorkCount doesn't need its own schema since it will use the AssignWork collection
// This file is included for organization consistency
// The actual counts will be retrieved via aggregation on the AssignWork collection

export default {};
