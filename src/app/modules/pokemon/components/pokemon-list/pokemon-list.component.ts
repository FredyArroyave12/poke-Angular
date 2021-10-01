import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { PokeState } from '../../reducers';
import {
  updateComparisonPokemon,
  updateCurrentPokemon,
} from '../../actions/pokemon.actions';
import { PokemonResources } from 'src/app/utils/pokemon/pokemon-resources';
import { environment } from 'src/environments/environment';
import { PokemonDialog } from 'src/app/utils/dialog/pokemon-dialog';
import { MatDialog } from '@angular/material/dialog';
import { PokemonListEntityService } from '../../services/pokemon-list-entity.service';
import { PokemonCardEntityService } from '../../services/pokemon-card-entity.service';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PokemonInformation } from 'src/app/utils/pokemon/pokemon-information';
import { PokemonListItem } from '../../interfaces/pokemon-list-item';

@Component({
  selector: 'pokemon-list',
  templateUrl: './pokemon-list.component.html',
  styleUrls: ['./pokemon-list.component.css'],
})
export class PokemonListComponent implements OnInit {
  @Input() currentPokemon: PokemonListItem;
  @Input() comparisonPokemon: PokemonListItem;
  @Input() isComparing: boolean;
  @Input()
  set pokemonList(pokemonList: PokemonListItem[]) {
    this.pokemonListItems = pokemonList;
    this.pokemonImages = pokemonList.map((pokemon) =>
      this.getImage(pokemon.url)
    );
    this.pokemonNames = pokemonList.map((pokemon) =>
      pokemon.name.toUpperCase()
    );
    if (this.favoritePokemonListItems) {
      this.favorites = pokemonList.map((pokemon) => this.isFavorite(pokemon));
    }
  }

  @Input()
  set favoritePokemonList(favoritePokemonList: PokemonListItem[]) {
    this.favoritePokemonListItems = favoritePokemonList;
    if (this.pokemonListItems) {
      this.favorites = this.pokemonListItems.map((pokemon) =>
        this.isFavorite(pokemon)
      );
    }
  }

  pokemonListItems: PokemonListItem[];
  favoritePokemonListItems: PokemonListItem[];
  pokemonNames: string[] = [];
  pokemonImages: string[] = [];
  favorites: boolean[] = [];
  nextOffset = 20;
  isFavoriteListFull = false;

  constructor(
    private courseService: PokemonListEntityService,
    private pokemonCardService: PokemonCardEntityService,
    private store: Store<PokeState>,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.favorites = this.pokemonListItems.map((pokemon) =>
      this.isFavorite(pokemon)
    );
  }

  loadMorePokemon(): void {
    this.courseService.getWithQuery({
      offset: this.nextOffset.toString(),
      limit: '20',
    });
    this.nextOffset += 20;
  }

  openPokemonCard(pokemon: PokemonListItem): void {
    this.pokemonCardService.getWithQuery({
      url: pokemon.url,
      speciesUrl: environment.speciesApi + pokemon.name,
    });

    if (this.isComparing) {
      this.comparisonPokemon = pokemon;
      this.store.dispatch(updateComparisonPokemon({ pokemon }));
    } else {
      this.currentPokemon = pokemon;
      this.store.dispatch(updateCurrentPokemon({ pokemon }));
    }

    const dialogConfig = PokemonDialog.defaultDialogConfig();
    dialogConfig.data = {
      isComparing: this.isComparing,
      currentPokemon: this.currentPokemon,
      comparisonPokemon: this.comparisonPokemon,
      favoritePokemonList: this.favoritePokemonListItems,
    };
    this.dialog.open(PokemonCardComponent, dialogConfig);
  }

  getImage(url: string): string {
    return PokemonResources.getPokemonImageUrl(parseInt(url.split('/')[6], 10));
  }

  isFavorite(pokemon: PokemonListItem): boolean {
    return PokemonInformation.isFavorite(
      this.favoritePokemonListItems,
      pokemon
    );
  }

  handleIsFavoriteFull(isFavoriteListFull: boolean): void {
    this.isFavoriteListFull = isFavoriteListFull;
  }
}