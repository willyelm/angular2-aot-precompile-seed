import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public isMenuOpen = false;
  content = `From prototype through global deployment, Angular delivers the
    productivity and scalable infrastructure that supports Google's largest
    applications.`;
}
