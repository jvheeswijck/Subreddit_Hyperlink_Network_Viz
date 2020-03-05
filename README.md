# Info Viz: Visualizing Inter-Subbreddit Hyperlinking
## What we did after the meeting of 27-02:
- Encoding in size of the node
- Adding links between nodes
- Highlighting Behaviour
- Click selection behaviour
- Performance enhancements
- Basic filtering on sentiment -> May need to adjust filtering logic for multiple filtering of various attributes

## To-Do
__updateNodes Function__  

__Date Range Selector__  
+ Update the graph code

__Sunburst Selectors__  
+ Implement selectors using Sunbursts
+ Requires TWO: One for source nodes, one for target nodes

__Tooltip Info__
+ Bottom left boxes displaying statistics and highlighted node information

__Subreddit Tooltip Names of Highlighted__  

__Subreddit Names when Zoomed X amount__  

__Custom area labeling overlay on toggle__  
+ Custom area shapes and labels for topics like football, soccer, technology, etc

__Subreddit Level view__  
+ Double click a node to enter subreddit view
+ Force graph with centered node of the subreddit
+ Toggle between in-bound, out-bound links, and sentiment as well

__In-Depth Information on the Right Sidebar__  
+ Can have two modes: one - non node selected view, two: node selected view
+ (Node Highlighted vs Non-Highlighted Views)

__Data Filters and Toggles on the Left Sidebar__  
+ Sentiment (95% Done)(Maybe include pip labels below)
+ In/Out Links (for Subreddit View only)
+ Maybe LIWC filtering with range-sliders (Highly Optional)

__Info Display Toggles__  
+ Node Size Update Code
+ Selected Highlight behaviour (Links: In, Out, Both)

__Node Search Function (95% done)__  
- Implement close button  
- Implement enter key-press to refine to single selection

__New User Tutorial__  
+ Sequence of tooltips guiding functionality

## Meeting Notes
### 27-02-2020
- We should add more functionality which:
    - is not a plot
    - is self sufficient
    - is not an individual component
    - conveys information
 - Add custom labelling such that:
    - Interesting clusters can be shown
    - Encoding in the size of circle and color
 - Try to implement something like a sunburst: if circular does not fit in the page idea, try semi-spherical, so that as the filtering criteria in the sun burst increases, the data decreases and the page is not too cluttered. 

### 20-02-2020
   - Try to find some labeling for the subreddits, or catagorization.
   
