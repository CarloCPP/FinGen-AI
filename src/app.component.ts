
import { Component, signal, inject } from '@angular/core';
import { GeneratorComponent } from './components/generator/generator.component';
import { InfoSearchComponent } from './components/info-search/info-search.component';
import { CommonModule } from '@angular/common';
import { GlobalSettingsService } from './services/global-settings.service';
import { FormsModule } from '@angular/forms';

type Tab = 'generator' | 'research';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, GeneratorComponent, InfoSearchComponent, FormsModule],
  templateUrl: './app.component.html',
  styles: []
})
export class AppComponent {
  settings = inject(GlobalSettingsService);
  activeTab = signal<Tab>('generator');

  setTab(tab: Tab) {
    this.activeTab.set(tab);
  }
}
