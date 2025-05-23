#!/bin/bash

#Here I will be creating a snake game using bash to leran all the features I need to add to Ç and to the game library so players will be able to make that kind of game

# Initial setup
first_draw=true
width=$(tput lines)   # game canvas width (correct would be adding cols instead of lines)
let "height = 10"   # game canvas height
let "snake_length = 1"
let "snake_x[0] = width / 2"
let "snake_y[0] = height / 2"
let "food_x = (RANDOM % (width - 2)) + 1"
let "food_y = (RANDOM % (height - 2)) + 1"
let "score = 0"

# game colors
BLUE=$(tput setaf 4)    # Blue snake
GREEN=$(tput setaf 2)  # Green borders
RED=$(tput setaf 1)  # Red fruits
RESET=$(tput sgr0)    # Resets the colors (make objects with different colors)

function draw_game {
    local output_buffer=""

    # pre generates the superior and inferior borders
    local top_bottom_border=$(printf "%0.s$GREEN-" $(seq 1 $width))
    output_buffer+="$top_bottom_border\n"

    # pre generates the lateral borders
    local side_border="$GREEN|$(printf "%0.s " $(seq 2 $(($width - 1))))|"

    # Prints the game field with the lateral borders
    for ((j=0; j<height; j++)); do
        output_buffer+="$GREEN|$RESET"
        for ((i=0; i<width; i++)); do
            local is_snake_part=false
            for ((k=0; k<snake_length; k++)); do
                if [ $i -eq ${snake_x[k]} ] && [ $j -eq ${snake_y[k]} ]; then
                    output_buffer+="$BLUE∎$RESET"
                    local is_snake_part=true
                    break
                fi
            done
            if ! $is_snake_part; then
                if [ $i -eq $food_x ] && [ $j -eq $food_y ]; then
                    output_buffer+="$RED*$RESET"
                else
                    output_buffer+=' '
                fi
            fi
        done
        output_buffer+="$GREEN|\n$RESET"
    done

    # Prints the inferior border
    output_buffer+="$top_bottom_border\n"

    # Shows the player's score under the bottom border
    output_buffer+="Score: $score\n"

    # Clears the terminal and prints the output buffer
    clear
    echo -e "$output_buffer"
}

: '
Implementing more optimized drawing method by using "tput cup"

function draw_game {
    # Draw the borders (only once if necessary)
    if [[ $first_draw == true ]]; then
        # Top and bottom
        tput cup 0 0
        printf "${GREEN}%0.s-" $(seq 1 $width)
        tput cup $((height + 1)) 0
        printf "${GREEN}%0.s-" $(seq 1 $width)

        # Sides
        for ((j = 1; j <= height; j++)); do
            tput cup $j 0
            printf "${GREEN}|"
            tput cup $j $((width - 1))
            printf "${GREEN}|"
        done
        first_draw=false
    fi

    # Update the snakes position
    for ((k = 0; k < snake_length; k++)); do
        tput cup ${snake_y[k]} ${snake_x[k]}
        printf "${BLUE}∎${RESET}"
    done

    # Update fruit position
    tput cup $food_y $food_x
    printf "${RED}*${RESET}"

    # Cleans the previous position of the snakes tail
    tput cup $tail_y $tail_x
    printf " "

    tput cup $((height + 2)) 0
    printf "${GREEN}Score: $score"
}
'

# Reads user input to move the snake
function read_input {
    read -t 0.2 -n 3 input

    case $input in 
        w)
            #   Prevents the player from walking in the opposite direction and hitting its back piece
            if [[ $move != "down" ]]; then
                move="up"
            fi
            ;;
        s)
            if [[ $move != "up" ]]; then
                move="down"
            fi
            ;;
        a)
            if [[ $move != "right" ]]; then
                move="left"
            fi
            ;;
        d)
            if [[ $move != "left" ]]; then
                move="right"
            fi
            ;;
    esac
}

# updates snake position and verifies if it has eaten the food
function update_game {
    local prev_x=${snake_x[0]}
    local prev_y=${snake_y[0]}
    local prev2_x prev2_y

    # renovates the snake position
    case $move in 
        up) let "snake_y[0] -= 1" ;;
        down) let "snake_y[0] += 1" ;;
        left) let "snake_x[0] -= 1" ;;
        right) let "snake_x[0] += 1" ;;
    esac

    # Verifies if snake has eaten the food, updates the score and the length of the snake
    if [ ${snake_x[0]} -eq $food_x ] && [ ${snake_y[0]} -eq $food_y ]; then
        let "score += 10"
        let "snake_length += 1"
        food_x=$((RANDOM % (width - 2) + 1))
        food_y=$((RANDOM % (height - 2) + 1))
    fi

    # updates snake body
    for ((i=1; i<snake_length; i++)); do
        prev2_x=${snake_x[i]}
        prev2_y=${snake_y[i]}
        snake_x[i]=$prev_x
        snake_y[i]=$prev_y
        prev_x=$prev2_x
        prev_y=$prev2_y
    done

    # Verifies if snake crashed into walls or itself and ends the game if that happens
    if [ ${snake_x[0]} -lt 0 ] || [ ${snake_x[0]} -ge $width ] || [ ${snake_y[0]} -lt 0 ] || [ ${snake_y[0]} -ge $height ]; then 
        exit; 
    fi
    
    for ((i=1; i<snake_length; i++)); do 
        if [ ${snake_x[i]} -eq ${snake_x[0]} ] && [ ${snake_y[i]} -eq ${snake_y[0]} ];
            then exit; 
        fi 
    done 
}

# main loop for the game
move='up'
while true; do 
    draw_game 
    read_input
    update_game
done
