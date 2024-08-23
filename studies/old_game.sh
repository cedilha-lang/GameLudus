#!/bin/bash

#Here I will be creating a snake game using bash to leran all the features I need to add to Ç and to the game library so players will be able to make that kind of game

# Initial setup
width=$(tput lines)   # game canvas width
let "height = 10"   # game canvas height
let "area = $width * $height"
let "snake_length = 1"
let "snake_x[0] = width / 2"
let "snake_y[0] = height / 2"
let "food_x = (RANDOM % (width - 2)) + 1"
let "food_y = (RANDOM % (height - 2)) + 1"
let "score = 0"

function draw_game {
    # pre generates te superior end inferior borders
    local top_bottom_border=$(printf "%0.s-" $(seq 1 $width))

    # pre generates the lateral borders
    local side_border="|$(printf "%0.s " $(seq 2 $(($width - 1))))|"

    # clears the terminal
    clear

    # prints the superior border
    echo "$top_bottom_border"

    # Prints the game field with the lateral borders
    for ((j=0; j<height; j++)); do
        echo -n '|'
        for ((i=0; i<width; i++)); do
            local is_snake_part=false
            for ((k=0; k<snake_length; k++)); do
                if [ $i -eq ${snake_x[k]} ] && [ $j -eq ${snake_y[k]} ]; then
                    echo -n '∎'
                    local is_snake_part=true
                    break
                fi
            done
            if ! $is_snake_part; then
                if [ $i -eq $food_x ] && [ $j -eq $food_y ]; then
                    echo -n '*'
                else
                    echo -n ' '
                fi
            fi
        done
        echo '|'
    done

    # Prints the inferior border
    echo "$top_bottom_border"

    # Shows the player's score under the bottom border
    echo "Score: $score"
}

# Reads user input to move the snake
function read_input {
    read -t 0.2 -n 3 input

    case $input in 
        w) move='up' ;;
        s) move='down' ;;
        a) move='left' ;;
        d) move='right' ;;
    esac
}

# updates snake position and verifies if it has eaten the food
function update_game {
    local prev_x=${snake_x[0]}
    local prev_y=${snake_y[0]}
    local prev2_x prev2_y

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

    # Verifies if nake crashed into walls or itself and ends the game if that happens
    if [ ${snake_x[0]} -lt 0 ] || [ ${snake_x[0]} -ge $width ] || [ ${snake_y[0]} -lt 0 ] || [ ${snake_y[0]} -ge $height ]; then exit; fi

    for ((i=1; i<snake_length; i++)); do 
        if [ ${snake_x[i]} -eq ${snake_x[0]} ] && [ ${snake_y[i]} -eq ${snake_y[0]} ]; then exit; fi 
    done 
}

# main loop for the game
move='up'
while true; do 
    draw_game 
    read_input
    update_game
done
