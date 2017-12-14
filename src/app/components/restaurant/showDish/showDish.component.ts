
import { Component, Input } from '@angular/core';
import { Dish } from '../../../models/dish';


@Component({
    selector: 'app-showDish',
    templateUrl: './showDish.component.html',
    styleUrls: ['./showDish.component.css']
})

export class ShowDishComponent {

    @Input() myDish : Dish;
    
}
