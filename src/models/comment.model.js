import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema= new Schema(
    {
        content:{
            type: String,
            required: true
        },
        video:{
            type: Schema.Types.ObjectId,
            ref: "Video"
        },
        owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
)

commentSchema.plugin(mongooseAggregatePaginate) //this gives us the ability to paginate the range of comments that should be provided and also in the next call again the range the comments should be provided.

export const Comment= mongoose.model("Comment", commentSchema)